import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { baseUrl } from "../../api/baseUrl";
import { cn } from "@/lib/utils";
import { TooltipPortal } from "@radix-ui/react-tooltip";
import { isDesktop } from "react-device-detect";
import { VscAccount } from "react-icons/vsc";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";
import { DialogClose } from "../ui/dialog";
import { LuLogOut } from "react-icons/lu";
import useSWR from "swr";
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from "sonner";
import { Button } from "../ui/button";


type AccountSettingsProps = {
  className?: string;
};

const fetcher = (url: string) => {
  console.log(url)
  console.log("Bearer " + Cookies.get('frigate_token'))
  return axios.get(url, {
    headers: {
      'Authorization': `Bearer ${Cookies.get('frigate_token')}`
    }
  }).then(res => {
    console.log(res.data)
    return res.data;
  });
}

export default function AccountSettings({ className }: AccountSettingsProps) {
  const { data: profile } = useSWR("profile", fetcher);
  const { data: config } = useSWR("config");
  const logoutUrl = config?.proxy?.logout_url || `${baseUrl}api/logout`;

  const Container = isDesktop ? DropdownMenu : Drawer;
  const Trigger = isDesktop ? DropdownMenuTrigger : DrawerTrigger;
  const Content = isDesktop ? DropdownMenuContent : DrawerContent;
  const MenuItem = isDesktop ? DropdownMenuItem : DialogClose;

  const logout = async () => {
    try {
      await axios.get(`${baseUrl}api/logout`, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('frigate_token')}`
        }
      });
      window.location.href = '/login';
    } catch (error) {
      console.error(error);
      toast.error("Error logging out", {
        position: "top-center",
      });
    }
  }

  return (
    <Container modal={!isDesktop}>
      <Trigger>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex flex-col items-center justify-center",
                isDesktop
                  ? "cursor-pointer rounded-lg bg-secondary text-secondary-foreground hover:bg-muted"
                  : "text-secondary-foreground",
                className,
              )}
            >
              <VscAccount className="size-5 md:m-[6px]" />
            </div>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent side="right">
              <p>Account</p>
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </Trigger>
      <Content
        className={
          isDesktop ? "mr-5 w-72" : "max-h-[75dvh] overflow-hidden p-2"
        }
      >
        <div className="scrollbar-container w-full flex-col overflow-y-auto overflow-x-hidden">
          <DropdownMenuLabel>
            Current User: {profile?.username || "anonymous"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className={isDesktop ? "mt-3" : "mt-1"} />
          <MenuItem
            className={
              isDesktop ? "cursor-pointer" : "flex items-center p-2 text-sm"
            }
            aria-label="Log out"
          >
            <Button onClick={() => logout()} className="flex" >
              <LuLogOut className="mr-2 size-4" />
              <span>Logout</span>
            </Button>
          </MenuItem>
        </div>
      </Content>
    </Container>
  );
}
