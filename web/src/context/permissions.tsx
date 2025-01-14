import { createContext } from "react";
import useSWR from "swr";

export type Permission = {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    download?: boolean;
}

export type Permissions = {
    admin: {
        users: Permission;
        export: Permission;
        config: Permission;
        logs: Permission;
    };
    user: {
        users: Permission;
        export: Permission;
        config: Permission;
        logs: Permission;
    };
    verifyPermission: (role: keyof Permissions, resource: keyof Permissions['admin'], action: keyof Permission) => boolean;
    profile: any;
}

const permissions: Omit<Permissions, 'verifyPermission' | 'profile'> = {
    admin: {
        users: {
            view: true,
            create: true,
            update: true,
            delete: true,
            download: true
        },
        export: {
            view: true,
            create: true,
            update: true,
            delete: true,
            download: true
        },
        config: {
            view: true,
            create: true,
            update: true,
            delete: true,
            download: true
        },
        logs: {
            view: true,
            create: true,
            update: true,
            delete: true,
            download: true
        }
    },
    user: {
        users: {
            view: false,
            create: false,
            update: false,
            delete: false,
            download: false
        },
        export: {
            view: true,
            create: false,
            update: false,
            delete: false,
            download: true
        },
        config: {
            view: false,
            create: false,
            update: false,
            delete: false,
            download: false
        },
        logs: {
            view: false,
            create: false,
            update: false,
            delete: false,
            download: false
        }
    }
};

export const PermissionContext = createContext<Permissions>({ ...permissions, verifyPermission: () => false, profile: null });

export default function PermissionProvider({children}: {children: React.ReactNode}) {

    const { data: profile } = useSWR("currentUser");
    console.log("Profile: ", profile);

    const verifyPermission = (role: keyof Permissions, resource: keyof Permissions['admin'], action: keyof Permission): boolean => {
        if (role === 'admin') {
            return true;
        }
        const rolePermissions = permissions[role as keyof Omit<Permissions, 'verifyPermission' | 'profile'>];
        return rolePermissions?.[resource]?.[action] ?? false;
    }

    return (
        <PermissionContext.Provider value={{ ...permissions, verifyPermission, profile }}>
            {children}
        </PermissionContext.Provider>
    );
}