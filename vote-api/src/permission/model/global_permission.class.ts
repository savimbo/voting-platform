import { GlobalPermissionEntity } from "permission/entities/global_permission.entity";


// Just to group permissions in user interface. Used as prefix of GlobalPermissionClass.text_id
export class GlobalPermissionCategoryClass {
    id: number;
    description: string;

    static getAllGlobalPermissionCategories(): GlobalPermissionCategoryClass[] {
        let categories: GlobalPermissionCategoryClass[] = [
            { id: 1, description: "sys_admin" },
            { id: 2, description: "user" },
            { id: 3, description: "organization" },
        ];
        return categories
    }
}

export enum GlobalPermission {
    sys_admin_FULL      = "sys_admin.full",
    user_profile_ADMIN  = "user_profile.admin",
    user_profile_MODIFY = "user_profile.modify",
    user_profile_VIEW   = "user_profile.view",
    organization_ADMIN  = "organization.admin",
    organization_CREATE = "organization.create",
    organization_MODIFY = "organization.modify",
    organization_VIEW   = "organization.view",
}

// These are just granted to users and apply globally
export class GlobalPermissionClass extends GlobalPermissionEntity {

    static getAllGlobalPermissions(): GlobalPermissionClass[] {
        let permissions: GlobalPermissionClass[] = [
            { id: 1 , text_id: GlobalPermission.sys_admin_FULL,         category_id: 1, scope: "Can do anything on the full system" },

            { id: 100, text_id: GlobalPermission.user_profile_ADMIN,    category_id: 2, scope: "Can do anything on user profiles and create users" },
            { id: 101, text_id: GlobalPermission.user_profile_MODIFY,   category_id: 2, scope: "Can view and modify user profiles" },
            { id: 102, text_id: GlobalPermission.user_profile_VIEW,     category_id: 2, scope: "Can view user profiles" },

            { id: 200, text_id: GlobalPermission.organization_ADMIN,    category_id: 3, scope: "Can do anything on any organization" },
            { id: 201, text_id: GlobalPermission.organization_CREATE,   category_id: 3, scope: "Can create, view and modify any organization" },
            { id: 202, text_id: GlobalPermission.organization_MODIFY,   category_id: 3, scope: "Can view and modify any organization" },
            { id: 203, text_id: GlobalPermission.organization_VIEW,     category_id: 3, scope: "Can view any organization" },
        ];
        return permissions
    }

    /*
    static contains(permissionAvailable: GlobalPermissionClass[], permissionsToCheck: string[]): boolean {
        permissionsToCheck.push(GlobalPermission.sys_admin_FULL); // It should always come, let's protect us here (although this could cause some other errors perhaps) 
        for (let i = 0; i < permissionsToCheck.length; i++) {
            if (permissionAvailable.find(p => p.text_id === permissionsToCheck[i])) {
                return true;
            }
        }
        return false;
    }*/
    static contains(permissionAvailable: GlobalPermission[], permissionsToCheck: string[]): boolean {
        permissionsToCheck.push(GlobalPermission.sys_admin_FULL); // It should always come, let's protect us here (although this could cause some other errors perhaps) 
        for (let i = 0; i < permissionsToCheck.length; i++) {
            if (permissionAvailable.find(p => p === permissionsToCheck[i])) {
                return true;
            }
        }
        return false;
    }

    static extractPermissions(allPerms : GlobalPermissionClass[], permsToExtract : string[]) : GlobalPermissionEntity[] {
        let permissions : GlobalPermissionEntity[] = [];
        for (const item of allPerms) {
          if (permsToExtract.includes(item.text_id)) {
            permissions.push(item);
          }
        }
        return permissions;
      }
}