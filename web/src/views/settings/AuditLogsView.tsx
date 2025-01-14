
import ActivityIndicator from "@/components/indicators/activity-indicator";
import { Badge } from "@/components/ui/badge";
import Heading from "@/components/ui/heading";
import useSWR from "swr";

type Audit = {
    id?: number,
    event_type: string,
    description: string,
    timestamp?: string | number,
    user?: string
}

export default function AuditLogsView({}){

    const {data: audits} = useSWR<Audit[]>("audits")

    if(!audits) {
        <div>loading</div> 
    }
    return (
        <div className="flex size-full flex-col md:flex-row">
            <div className="scrollbar-container order-last mb-10 mt-2 flex h-full w-full flex-col overflow-y-auto rounded-lg border-[1px] border-secondary-foreground bg-background_alt p-2 md:order-none md:mb-0 md:mr-2 md:mt-0">

                <Heading as="h3" className="my-2">
                    Audit Logs
                </Heading>
                <div className="space-y-2">
                {
                    audits?.map( (audit, index) => (
                        <div key={index} className="p-2 border-[1px] border-secondary-foreground rounded-lg flex justify-between ">
                            <div className="space-x-2.5">
                                <Badge variant={"secondary"} >{audit.event_type}</Badge>
                                <span>{audit.description}</span>
                            </div>
                            <div>
                                <span>{new Date(audit.timestamp).toLocaleDateString('en-us', {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "numeric",
                                    second: "numeric"
                                })}</span>
                                <span>{audit.user}</span>
                            </div>
                        </div>
                    ) )
                }
                </div>
            </div>
        </div>
    )
}