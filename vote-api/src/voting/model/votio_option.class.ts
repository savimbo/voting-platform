import { VotingOptionEntity } from "voting/entities/voting_option.entity";


export class VotingOptionClass extends VotingOptionEntity {

    static getAllVotingOptions(): VotingOptionClass[] {
        let ret: VotingOptionClass[] = [
            { id: 1, name: "yes" },
            { id: 2, name: "no" },
            { id: 3, name: "abstain" },
        ];
        return ret
    }
}

export enum VotingOption {
    Yes     = 1,
    No      = 2, 
    Abstain = 3,
}

