import { EntityPermissionEntity } from "permission/entities/entity_permission.entity";
import { GlobalPermissionEntity } from "permission/entities/global_permission.entity";


// Just to group permissions in user interface. Used as prefix of GlobalPermissionClass.text_id
export class EntityWithPermissionsClass {
    id: number;
    name: string;

    static getAllEntityWithPermissions(): EntityWithPermissionsClass[] {
        let ret: EntityWithPermissionsClass[] = [
            { id: 1, name: "user" },
            { id: 2, name: "account" },
            { id: 3, name: "org" },
            { id: 4, name: "payment" },
        ];
        return ret
    }
}

export enum OrganizationPermission {
    organization_CREATOR = "ent.organization.creator",
    organization_ADMIN   = "ent.organization.admin",
    organization_MEMBER  = "ent.organization.member",
}


// These are granted to users over specific entities: this user can edit this organization, but not any organization
export class EntityPermissionClass extends EntityPermissionEntity {

    static getAllEntityPermissions(): EntityPermissionClass[] {
        let permissions: EntityPermissionClass[] = [
            { id: 10000, text_id: OrganizationPermission.organization_CREATOR,  entity_id: 3, scope: "Can do anything on the organization created by them except vote and receive payments" },  // intended for third parties outsourcing our platform for their own organizations
            { id: 10001, text_id: OrganizationPermission.organization_ADMIN,    entity_id: 3, scope: "Member that manage votings, view and modify the organization data" },
            { id: 10002, text_id: OrganizationPermission.organization_MEMBER,   entity_id: 3, scope: "Can view the organization data, vote and receive payments" },
        ];
        return permissions
    }

    static extractPermissions(allPerms : EntityPermissionClass[], permsToExtract : string[]) : EntityPermissionEntity[] {
        let permissions : EntityPermissionEntity[] = [];
        for (const item of allPerms) {
          if (permsToExtract.includes(item.text_id)) {
            permissions.push(item);
          }
        }
        return permissions;
      }


}