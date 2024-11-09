
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("money_account")
export class MoneyAccountEntity {  
    @PrimaryColumn()
    id: string;

    @Column()
    account_number: string;

}
