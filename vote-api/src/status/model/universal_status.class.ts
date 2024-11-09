import { GlobalPermissionEntity } from "permission/entities/global_permission.entity";
import { UniversalStatusEntity } from "status/entities/universal_status.entity";



export class UniversalStatusClass extends UniversalStatusEntity {

    static getAllUniversalStatuses(): UniversalStatusClass[] {
        let ret: UniversalStatusClass[] = [
            { id: 1, name: "Created" },
            { id: 2, name: "Review" },
            { id: 3, name: "Test_sent" },
            { id: 4, name: "Approved" },
            { id: 5, name: "Active" },
            { id: 6, name: "Complete" },
            { id: 7, name: "On_hold" },
            { id: 8, name: "Quit" },
            { id: 9, name: "Rejected" },
        ];
        return ret
    }
}

export enum UniversalStatus {
    Created     = 1,
    Review      = 2, 
    Test_sent   = 3,
    Approved    = 4,
    Active      = 5,
    Complete    = 6,
    On_hold     = 7,
    Quit        = 8,
    Rejected    = 9
}


