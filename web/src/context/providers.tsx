import { ReactNode } from "react";
import { ThemeProvider } from "@/context/theme-provider";
import { RecoilRoot } from "recoil";
import { ApiProvider } from "@/api";
import { IconContext } from "react-icons";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StatusBarMessagesProvider } from "@/context/statusbar-provider";
import { SidebarProvider } from "@/components/ui/sidebar"
import PermissionProvider from "./permissions";

type TProvidersProps = {
  children: ReactNode;
};

function providers({ children }: TProvidersProps) {
  return (
    <RecoilRoot>
      <ApiProvider>
        <PermissionProvider>
          <ThemeProvider defaultTheme="system" storageKey="frigate-ui-theme">
            <TooltipProvider>
              <SidebarProvider>
                <IconContext.Provider value={{ size: "20" }}>
                  <StatusBarMessagesProvider>{children}</StatusBarMessagesProvider>
                </IconContext.Provider>
              </SidebarProvider>
            </TooltipProvider>
          </ThemeProvider>
        </PermissionProvider>
      </ApiProvider>
    </RecoilRoot>
  );
}

export default providers;
