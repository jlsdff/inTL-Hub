import {
  LuActivity,
  LuLogOut,
  LuMoon,
  LuPenSquare,
  LuSettings,
  LuSun,
  LuSunMoon,
} from "react-icons/lu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { Link } from "react-router-dom";
import { CgDarkMode } from "react-icons/cg";
import {
  colorSchemes,
  friendlyColorSchemeName,
  useTheme,
} from "@/context/theme-provider";
import { IoColorPalette } from "react-icons/io5";

import { useState, useContext } from "react";
import { useRestart } from "@/api/ws";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isDesktop, isMobile } from "react-device-detect";
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogPortal,
  DialogTrigger,
} from "../ui/dialog";
import { TooltipPortal } from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import RestartDialog from "../overlay/dialog/RestartDialog";
import { PermissionContext } from "@/context/permissions";

type GeneralSettingsProps = {
  className?: string;
};

export default function GeneralSettings({ className }: GeneralSettingsProps) {
  const { profile } = useContext(PermissionContext);
  const { data: config } = useSWR("config");
  const logoutUrl = config?.proxy?.logout_url || "/api/logout";

  // settings

  const { theme, colorScheme, setTheme, setColorScheme } = useTheme();
  const [restartDialogOpen, setRestartDialogOpen] = useState(false);
  const { send: sendRestart } = useRestart();

  const Container = isDesktop ? DropdownMenu : Drawer;
  const Trigger = isDesktop ? DropdownMenuTrigger : DrawerTrigger;
  const Content = isDesktop ? DropdownMenuContent : DrawerContent;
  const MenuItem = isDesktop ? DropdownMenuItem : DialogClose;
  const SubItem = isDesktop ? DropdownMenuSub : Dialog;
  const SubItemTrigger = isDesktop ? DropdownMenuSubTrigger : DialogTrigger;
  const SubItemContent = isDesktop ? DropdownMenuSubContent : DialogContent;
  const Portal = isDesktop ? DropdownMenuPortal : DialogPortal;

  return (
    <>
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
                <LuSettings className="size-5 md:m-[6px]" />
              </div>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent side="right">
                <p>Settings</p>
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </Trigger>
        <Content
          style={
            isDesktop
              ? {
                  maxHeight:
                    "var(--radix-dropdown-menu-content-available-height)",
                }
              : {}
          }
          className={
            isDesktop
              ? "scrollbar-container mr-5 w-72 overflow-y-auto"
              : "max-h-[75dvh] overflow-hidden p-2"
          }
        >
          <div className="scrollbar-container w-full flex-col overflow-y-auto overflow-x-hidden">
            {isMobile && (
              <>
                <DropdownMenuLabel>
                  Current User: {profile?.username || "anonymous"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator
                  className={isDesktop ? "mt-3" : "mt-1"}
                />
                <MenuItem
                  className={
                    isDesktop
                      ? "cursor-pointer"
                      : "flex items-center p-2 text-sm"
                  }
                  aria-label="Log out"
                >
                  <a className="flex" href={logoutUrl}>
                    <LuLogOut className="mr-2 size-4" />
                    <span>Logout</span>
                  </a>
                </MenuItem>
              </>
            )}
            <DropdownMenuLabel>System</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className={isDesktop ? "" : "flex flex-col"}>
              <Link to="/system#general">
                <MenuItem
                  className={
                    isDesktop
                      ? "cursor-pointer"
                      : "flex w-full items-center p-2 text-sm"
                  }
                  aria-label="System metrics"
                >
                  <LuActivity className="mr-2 size-4" />
                  <span>System metrics</span>
                </MenuItem>
              </Link>

            </DropdownMenuGroup>
            {
              profile?.role === 'admin' && (
                <>
                <DropdownMenuLabel className={isDesktop ? "mt-3" : "mt-1"}>
                Configuration
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                </>
              )
            }
            <DropdownMenuGroup>
              {profile?.role === 'admin' && (
                <>
                  <Link to="/settings">
                    <MenuItem
                      className={
                        isDesktop
                          ? "cursor-pointer"
                          : "flex w-full items-center p-2 text-sm"
                      }
                      aria-label="Settings"
                    >
                      <LuSettings className="mr-2 size-4" />
                      <span>Settings</span>
                    </MenuItem>
                  </Link>
                </>
              )}
            </DropdownMenuGroup>
            <DropdownMenuLabel className={isDesktop ? "mt-3" : "mt-1"}>
              Appearance
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <SubItem>
              <SubItemTrigger
                className={
                  isDesktop
                    ? "cursor-pointer"
                    : "flex items-center p-2 text-sm"
                }
              >
                <LuSunMoon className="mr-2 size-4" />
                <span>Dark Mode</span>
              </SubItemTrigger>
              <Portal>
                <SubItemContent
                  className={
                    isDesktop ? "" : "w-[92%] rounded-lg md:rounded-2xl"
                  }
                >
                  <span tabIndex={0} className="sr-only" />
                  <MenuItem
                    className={
                      isDesktop
                        ? "cursor-pointer"
                        : "flex items-center p-2 text-sm"
                    }
                    aria-label="Light mode"
                    onClick={() => setTheme("light")}
                  >
                    {theme === "light" ? (
                      <>
                        <LuSun className="mr-2 size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        Light
                      </>
                    ) : (
                      <span className="ml-6 mr-2">Light</span>
                    )}
                  </MenuItem>
                  <MenuItem
                    className={
                      isDesktop
                        ? "cursor-pointer"
                        : "flex items-center p-2 text-sm"
                    }
                    aria-label="Dark mode"
                    onClick={() => setTheme("dark")}
                  >
                    {theme === "dark" ? (
                      <>
                        <LuMoon className="mr-2 size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        Dark
                      </>
                    ) : (
                      <span className="ml-6 mr-2">Dark</span>
                    )}
                  </MenuItem>
                  <MenuItem
                    className={
                      isDesktop
                        ? "cursor-pointer"
                        : "flex items-center p-2 text-sm"
                    }
                    aria-label="Use the system settings for light or dark mode"
                    onClick={() => setTheme("system")}
                  >
                    {theme === "system" ? (
                      <>
                        <CgDarkMode className="mr-2 size-4 scale-100 transition-all" />
                        System
                      </>
                    ) : (
                      <span className="ml-6 mr-2">System</span>
                    )}
                  </MenuItem>
                </SubItemContent>
              </Portal>
            </SubItem>
            <SubItem>
              <SubItemTrigger
                className={
                  isDesktop
                    ? "cursor-pointer"
                    : "flex items-center p-2 text-sm"
                }
              >
                <LuSunMoon className="mr-2 size-4" />
                <span>Theme</span>
              </SubItemTrigger>
              <Portal>
                <SubItemContent
                  className={
                    isDesktop ? "" : "w-[92%] rounded-lg md:rounded-2xl"
                  }
                >
                  <span tabIndex={0} className="sr-only" />
                  {colorSchemes.map((scheme) => (
                    <MenuItem
                      key={scheme}
                      className={
                        isDesktop
                          ? "cursor-pointer"
                          : "flex items-center p-2 text-sm"
                      }
                      aria-label={`Color scheme - ${scheme}`}
                      onClick={() => setColorScheme(scheme)}
                    >
                      {scheme === colorScheme ? (
                        <>
                          <IoColorPalette className="mr-2 size-4 rotate-0 scale-100 transition-all" />
                          {friendlyColorSchemeName(scheme)}
                        </>
                      ) : (
                        <span className="ml-6 mr-2">
                          {friendlyColorSchemeName(scheme)}
                        </span>
                      )}
                    </MenuItem>
                  ))}
                </SubItemContent>
              </Portal>
            </SubItem>
          </div>
        </Content>
      </Container>
      <RestartDialog
        isOpen={restartDialogOpen}
        onClose={() => setRestartDialogOpen(false)}
        onRestart={() => sendRestart("restart")}
      />
    </>
  );
}