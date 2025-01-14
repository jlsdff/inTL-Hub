"""Export apis."""

import logging
import random
import string
import time
from pathlib import Path

import psutil
from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from peewee import DoesNotExist
from playhouse.shortcuts import model_to_dict

from frigate.api.auth import currentUser
from frigate.api.defs.request.export_recordings_body import ExportRecordingsBody
from frigate.api.defs.tags import Tags
from frigate.const import EXPORT_DIR
from frigate.models import Audits, Export, Previews, Recordings
from frigate.record.export import (
    PlaybackFactorEnum,
    PlaybackSourceEnum,
    RecordingExporter,
)
from frigate.util.builtin import is_current_hour

logger = logging.getLogger(__name__)

router = APIRouter(tags=[Tags.export])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


@router.get("/exports")
def get_exports():
    exports = Export.select().order_by(Export.date.desc()).dicts().iterator()
    return JSONResponse(content=[e for e in exports])


@router.post("/export/{camera_name}/start/{start_time}/end/{end_time}")
def export_recording(
    request: Request,
    camera_name: str,
    start_time: float,
    end_time: float,
    body: ExportRecordingsBody,
    user: str = Depends(currentUser),
):
    if not camera_name or not request.app.frigate_config.cameras.get(camera_name):
        return JSONResponse(
            content=(
                {"success": False, "message": f"{camera_name} is not a valid camera."}
            ),
            status_code=404,
        )

    playback_factor = body.playback
    playback_source = body.source
    friendly_name = body.name
    existing_image = body.image_path

    if playback_source == "recordings":
        recordings_count = (
            Recordings.select()
            .where(
                Recordings.start_time.between(start_time, end_time)
                | Recordings.end_time.between(start_time, end_time)
                | (
                    (start_time > Recordings.start_time)
                    & (end_time < Recordings.end_time)
                )
            )
            .where(Recordings.camera == camera_name)
            .count()
        )

        if recordings_count <= 0:
            return JSONResponse(
                content=(
                    {"success": False, "message": "No recordings found for time range"}
                ),
                status_code=400,
            )
    else:
        previews_count = (
            Previews.select()
            .where(
                Previews.start_time.between(start_time, end_time)
                | Previews.end_time.between(start_time, end_time)
                | ((start_time > Previews.start_time) & (end_time < Previews.end_time))
            )
            .where(Previews.camera == camera_name)
            .count()
        )

        if not is_current_hour(start_time) and previews_count <= 0:
            return JSONResponse(
                content=(
                    {"success": False, "message": "No previews found for time range"}
                ),
                status_code=400,
            )

    export_id = f"{camera_name}_{''.join(random.choices(string.ascii_lowercase + string.digits, k=6))}"
    exporter = RecordingExporter(
        request.app.frigate_config,
        export_id,
        camera_name,
        friendly_name,
        existing_image,
        int(start_time),
        int(end_time),
        (
            PlaybackFactorEnum[playback_factor]
            if playback_factor in PlaybackFactorEnum.__members__.values()
            else PlaybackFactorEnum.realtime
        ),
        (
            PlaybackSourceEnum[playback_source]
            if playback_source in PlaybackSourceEnum.__members__.values()
            else PlaybackSourceEnum.recordings
        ),
    )
    exporter.start()
    Audits.insert(
        {
            Audits.event_type: "Export",
            Audits.description: f"{user} created an export for {camera_name}",
            Audits.user_id: user,
            Audits.timestamp: int(time.time()),
        }
    ).execute()
    return JSONResponse(
        content=(
            {
                "success": True,
                "message": "Starting export of recording.",
                "export_id": export_id,
            }
        ),
        status_code=200,
    )


@router.patch("/export/{event_id}/{new_name}")
def export_rename(event_id: str, new_name: str, user: str = Depends(currentUser)):
    try:
        export: Export = Export.get(Export.id == event_id)
    except DoesNotExist:
        return JSONResponse(
            content=(
                {
                    "success": False,
                    "message": "Export not found.",
                }
            ),
            status_code=404,
        )

    export.name = new_name
    export.save()
    Audits.insert(
        {
            Audits.event_type: "Rename Export",
            Audits.description: f"Renamed export to {new_name}",
            Audits.user_id: user,
            Audits.timestamp: int(time.time()),
        }
    ).execute()
    return JSONResponse(
        content=(
            {
                "success": True,
                "message": "Successfully renamed export.",
            }
        ),
        status_code=200,
    )


@router.delete("/export/{event_id}")
def export_delete(event_id: str, user: str = Depends(currentUser)):
    try:
        export: Export = Export.get(Export.id == event_id)
    except DoesNotExist:
        return JSONResponse(
            content=(
                {
                    "success": False,
                    "message": "Export not found.",
                }
            ),
            status_code=404,
        )

    files_in_use = []
    for process in psutil.process_iter():
        try:
            if process.name() != "ffmpeg":
                continue
            file_list = process.open_files()
            if file_list:
                for nt in file_list:
                    if nt.path.startswith(EXPORT_DIR):
                        files_in_use.append(nt.path.split("/")[-1])
        except psutil.Error:
            continue

    if export.video_path.split("/")[-1] in files_in_use:
        return JSONResponse(
            content=(
                {"success": False, "message": "Can not delete in progress export."}
            ),
            status_code=400,
        )

    Path(export.video_path).unlink(missing_ok=True)

    if export.thumb_path:
        Path(export.thumb_path).unlink(missing_ok=True)

    export.delete_instance()
    Audits.insert(
        {
            Audits.event_type: "Delete Export",
            Audits.description: "Deleted export",
            Audits.user_id: user,
            Audits.timestamp: int(time.time()),
        }
    ).execute()
    return JSONResponse(
        content=(
            {
                "success": True,
                "message": "Successfully deleted export.",
            }
        ),
        status_code=200,
    )


@router.get("/exports/{export_id}")
def get_export(export_id: str):
    try:
        return JSONResponse(content=model_to_dict(Export.get(Export.id == export_id)))
    except DoesNotExist:
        return JSONResponse(
            content={"success": False, "message": "Export not found"},
            status_code=404,
        )
