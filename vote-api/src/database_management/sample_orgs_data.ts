import { OrganizationMemberCreationRequest } from "organization/dto/organization_member";
import { OrganizationService } from "organization/organization.service"
import { EntityRoleEntity } from "permission/entities/entity_permission.entity";
import { UserEntity } from "users/entities/user.entity";
import { UsersService } from "users/users.service"
import { CreateVotingDto } from "voting/dto/create_voting.dto";
import { ItemVoting } from "voting/dto/item_voting.dto";
import { VotingOption } from "voting/model/votio_option.class";
import { VotingService } from "voting/voting.service"


export class SampleOrgData {

    constructor(
        private readonly organizationService: OrganizationService,
        private readonly votingService: VotingService,
        private orgRoleAdmin : EntityRoleEntity,
        private orgRoleMember : EntityRoleEntity,
        private adminUser : UserEntity,
        private users: UserEntity[],
    ) {
    }



    private async addMembershipToOrg(userId: string, roleId: string[], creatorId: string) {
        let membership = new OrganizationMemberCreationRequest();
        membership.id = userId;
        membership.roles = roleId;
        await this.organizationService.createMembership(membership, creatorId);
    }

    private async addAdminToOrg(userId: string, creatorId: string) {
        await this.addMembershipToOrg(userId, [this.orgRoleAdmin.id, this.orgRoleMember.id], creatorId);
    }

    private async addMemberToOrg(userId: string, creatorId: string) : Promise<string> {
        await this.addMembershipToOrg(userId, [this.orgRoleMember.id], creatorId);
        return userId
    }

    private async createVotingCompleted(creatorId: string, approvers: string[], members: string[], final_result: number, votingName: string) {
        const votingId = await this.createVotingInReview(creatorId, approvers, votingName);
        // now the voting is active: simulate votes
        if (final_result >= VotingOption.Yes) {
            const totalMembers = members.length + approvers.length + 1; // plus creator
            const quorum = Math.round((totalMembers * 90) / 100);  // 90% but this is an org setting  
            for (let a of approvers) {
                const vote = ((final_result + 1) % 3) + 1; // vote something different to final_result 
                await this.votingService.submitBallot( { vote: vote}, a, votingId);
            }
            for (let i = 0; i< members.length; i++) {
                if (i + approvers.length < quorum) {
                    const m = members[i];
                    await this.votingService.submitBallot( { vote: final_result}, m,votingId);
                }
            }
        }
        else {  
            for (let a of approvers) {  // not enough to achieve quorum
                const vote = Math.floor(Math.random() * 3) + 1;  // 1 to 3
                await this.votingService.submitBallot( { vote: vote}, a, votingId);
            }
        }
        await this.votingService.closeVoting(votingId, creatorId);
    }

    private async createVotingActive(creatorId: string, approvers: string[], members: string[], votingName: string) {
        const votingId = await this.createVotingInReview(creatorId, approvers, votingName);
        // now the voting is active: simulate votes
        const nVotes = Math.floor((members.length * 2) / 3);  // 2/3 of members vote
        for (let i = 0; i< nVotes; i++) {
            const m = members[i];
            const vote = Math.floor(Math.random() * 3) + 1;  // 1 to 3
            await this.votingService.submitBallot( { vote: vote}, m, votingId);
        }
        for (let a of approvers) {
            const vote = Math.floor(Math.random() * 3) + 1;  // 1 to 3
            await this.votingService.submitBallot( { vote: vote}, a, votingId);
        }
    }

    private async createVotingInReview(creatorId: string, approvers: string[], votingName: string) : Promise<string> {
        let voting = new CreateVotingDto();
        voting.name_voting = votingName;
        voting.description_voting = "Description for " + votingName;
        voting.note_voting = "Note for " + votingName;
        // items
        const nItems = Math.floor(Math.random() * 3) + 1;  // 1 to 3 items
        for (let i = 0; i < nItems; i++) {
            const rate = parseFloat((Math.random() * 10000 + 10).toFixed(2));  // 10 to 10010
            const quantity = Math.floor(Math.random() * 5) + 1; // 1 to 5 items
            const amount = rate * quantity;
            const item : ItemVoting = {
                id: -1,
                description: "Description for item " + i,
                vendor: "",
                amount: amount,
                rate: rate,
                quantity: quantity
            }
            voting.items.push(item);
        }
        const savedVoting = await this.votingService.create(voting, creatorId);
        // add approvals
        for (let a of approvers) {
            await this.votingService.createApproval( { approved: VotingOption.Yes}, a, savedVoting.id);
        }

        return savedVoting.id;
    }

    async createSampleOrgData() {
        let userIx = 0;
        let members : string[] = [];

        await this.organizationService.createVoteSettingForOrganization()

        await this.addAdminToOrg(this.adminUser.id,   this.adminUser.id);
        await this.addAdminToOrg(this.users[0].id,    this.adminUser.id);
        await this.addAdminToOrg(this.users[1].id,    this.adminUser.id);
        
        for (userIx = 2; userIx < this.users.length; userIx++) {
            members.push(await this.addMemberToOrg(this.users[userIx].id, this.adminUser.id));
        }

        await this.createVotingCompleted(this.adminUser.id, [this.users[0].id, this.users[1].id], members, VotingOption.Yes, "Ecological trail");
        await this.createVotingCompleted(this.adminUser.id, [this.users[0].id, this.users[1].id], members, VotingOption.No, "Tree planting");
        await this.createVotingCompleted(this.users[0].id, [this.adminUser.id, this.users[1].id], members, VotingOption.Abstain, "Biodiversity monitoring");
        await this.createVotingCompleted(this.users[1].id, [this.users[0].id, this.adminUser.id], members, 0, "Seedling nursery");

        await this.createVotingActive(this.adminUser.id,[this.users[0].id, this.users[1].id], members, "School training materials");
        await this.createVotingActive(this.users[0].id, [this.adminUser.id, this.users[1].id], members, "Ambulance service");

        await this.createVotingInReview(this.adminUser.id, [], "Legal rights for nature");
        await this.createVotingInReview(this.users[0].id, [], "Construction of a footbridge");
        await this.createVotingInReview(this.users[1].id, [], "Construction of school addition");

    }


}