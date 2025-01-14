import logging

from fastapi import APIRouter, Request, Response
from fastapi.responses import JSONResponse

from frigate.api.defs.tags import Tags
from frigate.models import Audits

logger = logging.getLogger(__name__)

router = APIRouter(tags=[Tags.auth])


@router.get("/audits")
def get_audits(request: Request, response: Response):
    audits = (
        Audits.select(
            Audits.id,
            Audits.event_type,
            Audits.description,
            Audits.timestamp,
            Audits.user_id,
        )
        .order_by(Audits.timestamp.desc())
        .dicts()
        .iterator()
    )
    return JSONResponse(content=([audit for audit in audits]), status_code=200)
