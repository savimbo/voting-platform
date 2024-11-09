import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVotingDto } from './dto/create_voting.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { VotingEntity } from './entities/voting.entity';
import { Repository } from 'typeorm';
import { UniversalStatus } from 'status/model/universal_status.class';
import { SavimboUid } from 'util/savimbo-uids';
import { ItemVotingEntity } from './entities/item_voting.entity';
import { Voting } from './dto/voting.dto';
import { VotingProfile } from './dto/voting_profile.dto';
import { VotingApproval, VotingApprovalRequest } from './dto/voting_approval.dto';
import { VotingApprovalEntity } from './entities/voting_approval.entity';
import { VotingOption } from './model/votio_option.class';
import { VoteEntity } from './entities/vote.entity';
import { VoteBallot, VoteLogEntry, VotingResults } from './dto/vote.dto';
import { UsersService } from 'users/users.service';
import { OrganizationService } from 'organization/organization.service';

@Injectable()
export class VotingService {
  constructor(
    @InjectRepository(VotingEntity) // inyecta el repositorio de VotingEntity para interactuar con la base de datos
    private votingRepository: Repository<VotingEntity>, //permite realizar operaciones como insertar, actualizar, eliminar 
    @InjectRepository(ItemVotingEntity)
    private itemRepository: Repository<ItemVotingEntity>,
    @InjectRepository(VotingApprovalEntity)
    private approvalRepository: Repository<VotingApprovalEntity>,
    @InjectRepository(VoteEntity)
    private voteRepository: Repository<VoteEntity>,
    private userService: UsersService,
    private organizationService: OrganizationService,
  ) {   }

  

  // #region create

  async create(createVotingDto: CreateVotingDto, byUser: string): Promise<VotingEntity> {
    const items : ItemVotingEntity[] = [];
    for (let i = 0; i < createVotingDto.items.length; i++) {
      const itemDto = createVotingDto.items[i];
      const newItem = new ItemVotingEntity();
      newItem.vendor = itemDto.vendor;
      newItem.description = itemDto.description;
      newItem.quantity = itemDto.quantity;
      newItem.rate = itemDto.rate;
      newItem.amount = itemDto.amount;
      await this.itemRepository.save(newItem);
      items.push(newItem);
    }

    const newVoting = new VotingEntity();
    newVoting.id = SavimboUid.generate(),
    newVoting.name_voting = createVotingDto.name_voting;
    newVoting.description_voting = createVotingDto.description_voting;
    newVoting.note_voting = createVotingDto.note_voting;
    newVoting.items = items;
    newVoting.created_by = byUser;
    newVoting.updated_by = byUser;
    newVoting.status_id = UniversalStatus.Review;

    let times = 0;
    let success = false;
    while(!success) {
      try{
        await this.votingRepository.insert(newVoting);
        success = true;
      }
      catch (error: any) {
        if (error.code === '23505') { // restriccion de unicidad: retry
          newVoting.id = SavimboUid.generate();
          times++;
          console.log('Error creando user: unique constrain. Retrying');
        }
        else {
          console.error('Error creando user:', error);
          throw new BadRequestException('Error creating user');
        }
        if (times == 5) {
          console.error('Error creando user:', error);
          throw new ConflictException('Error creating user');
        }
      } 
      //finally {  }
    }
    const ret = await this.votingRepository.save(newVoting); // to save the dependencies
    // count the creator as an approver
    await this.createApproval({ approved: VotingOption.Yes }, byUser, ret.id);
    return ret;
  }

  // #region find
  
  async findAll(byUser: string): Promise<VotingProfile[]> {
    const votings = await this.votingRepository.find();
    const ret : VotingProfile[] = []; 
    for (let i = 0; i < votings.length; i++) {
      let voting = votings[i];
      let votingProfile = VotingProfile.createFromVotingEntity(voting)
      votingProfile.results = await this.getVotingResults(voting.id);  
      votingProfile.creator = await this.userService.getUserProfileSummary(voting.created_by);
      votingProfile.approvals = await this.findVotingApprovals(voting.id);
      ret.push(votingProfile);
    }
    return ret;                                              
  }

  async findOne(id: string, byUser: string): Promise<Voting> {
    const voting = await this.votingRepository.findOne({ 
                                                where: { id: id },
                                                relations: {
                                                  items: true,
                                                },
                                              });
    if (!voting) {
      throw new NotFoundException(`Voting with id ${id} not found`);
    }
    const ret = Voting.createFromVotingEntity(voting)
    ret.approvals = await this.findVotingApprovals(voting.id);
    ret.creator = await this.userService.getUserProfileSummary(voting.created_by);
    ret.calling_user_votes = await this.findVoteHistory(byUser, voting.id);
    ret.results = await this.getVotingResults(voting.id);
    return ret;
  }

  // #region update

  async updateVoting(voting: Voting, byUser: string) : Promise<void> {
    // update items
    await this.itemRepository.delete({ vote_id: voting.id }); // borra todos los items de la votacion
    //vuelve a crearlos con los nuevos datos
    const items : ItemVotingEntity[] = [];
    for (let i = 0; i < voting.items.length; i++) {
      const itemDto = voting.items[i];
      const newItem = new ItemVotingEntity();
      newItem.vendor = itemDto.vendor;
      newItem.description = itemDto.description;
      newItem.quantity = itemDto.quantity;
      newItem.rate = itemDto.rate;
      newItem.amount = itemDto.amount;
      await this.itemRepository.save(newItem);
      items.push(newItem);
    }
    // update voting
    const votingEntity = new VotingEntity();
    votingEntity.id = voting.id;
    votingEntity.name_voting = voting.name_voting;
    votingEntity.description_voting = voting.description_voting;
    votingEntity.note_voting = voting.note_voting;
    votingEntity.status_id = voting.status;
    votingEntity.updated_by = byUser;
    votingEntity.items = items;
    await this.votingRepository.save(votingEntity);
  }

  async closeVoting(votingId: string, byUser: string) : Promise<void> {
    const winningPctg = 50;  
    let final_result : number = 0;
    let results = await this.getVotingResults(votingId);
    if (results.yes.total_votes + results.no.total_votes + results.abstain.total_votes >= results.quorum.total_votes) {
      if (results.yes.percentage >= winningPctg) {
        final_result = VotingOption.Yes;
      }
      else if (results.no.percentage >= winningPctg) {
        final_result = VotingOption.No;
      }      
      else if (results.abstain.percentage >= winningPctg) {
        final_result = VotingOption.Abstain;
      } 
      else {
        // no option reached enough votes
      }
    }
    const close_date = new Date();

    const votingEntity = new VotingEntity();
    votingEntity.id = votingId;
    votingEntity.status_id = final_result > 0 ? UniversalStatus.Complete : UniversalStatus.On_hold;
    votingEntity.final_result = final_result;
    votingEntity.closed_at = close_date
    await this.votingRepository.save(votingEntity);
  }

  // #region Approvals

  private async findVotingApprovals(votingId: string): Promise<VotingApproval[]> {
    const approvals : VotingApproval[] = [];
    const admins = await this.organizationService.findAdminOrganizationUserMembers();
    for (let i = 0; i < admins.length; i++) {
      const admin = admins[i];
      const approvalEntity = await this.approvalRepository.findOne({ 
          where: { user_id: admin.id, voting_id: votingId },
          order: { created_at: 'DESC' },
      });
      if (approvalEntity) {
        const approval : VotingApproval = {
            user: admin,
            approved: approvalEntity.option_id,
            created_at: approvalEntity.created_at,
          }
        approvals.push(approval);
      }
      else {
        const approval : VotingApproval = {
          user: admin,
          approved: VotingOption.No, 
          created_at: null,
        }
        approvals.push(approval);
      }
    }
    return approvals;
  }

  async createApproval(approval: VotingApprovalRequest, byUser: string, votingId: string) : Promise<VotingApproval[]> { 
    const approvalEntity = new VotingApprovalEntity();
    approvalEntity.user_id = byUser;
    approvalEntity.voting_id = votingId;
    approvalEntity.option_id = approval.approved;
    await this.approvalRepository.save(approvalEntity);

    const [ret, voteSettings] = await Promise.all([
                          this.findVotingApprovals(votingId), 
                          this.organizationService.findVoteSettingForOrganization(byUser)]);

    // change voting status automatically 
    let nApprovals = 0;
    for (let i = 0; i < ret.length; i++) {
      if (ret[i].approved == VotingOption.Yes) {
        nApprovals++;
      }
    }
    const approvalPercentage = (nApprovals * 100) / ret.length
    if (approvalPercentage >= voteSettings.superadmin_quorum_pctg) {
      // enough admin approved: change status 
      const votingEntity = await this.votingRepository.findOne({ where: { id: votingId } });
      if (votingEntity.status_id !== UniversalStatus.Active) {
        votingEntity.status_id = UniversalStatus.Active;
        votingEntity.active_at = new Date();
        await this.votingRepository.save(votingEntity);
      }
    }
    return ret;
  }

  // #region Votes

  private distributePercentages(votes: number[], totalVotes: number): number[] {
    let percentages: number[] = votes.map(vote => (vote / totalVotes) * 100);
    let roundedPercentages: number[] = percentages.map(Math.floor); 
    let totalRounded: number = roundedPercentages.reduce((a, b) => a + b, 0);
    let remainder: number = 100 - totalRounded;
    let decimals = percentages.map((p, i) => ({ index: i, decimal: p - roundedPercentages[i] }));
    decimals.sort((a, b) => b.decimal - a.decimal);
    for (let i = 0; i < remainder; i++) {
      roundedPercentages[decimals[i].index]++;
    }
    return roundedPercentages;
  }
  
  private async getVotingResults(votingId: string) : Promise<VotingResults> {
    const ret = new VotingResults();
    ret.total_members = await this.organizationService.getNumberOrgVotingUserMembers();

    const voteCounts = await this.voteRepository
              .createQueryBuilder('vote')
                  .select('vote.option_id', 'option')
                  .addSelect('COUNT(vote.id)', 'totalVotes')
                  .where(qb => {
                    const subQuery = qb.subQuery()
                      .select('MAX(subVote.created_at)')
                      .from(VoteEntity, 'subVote')
                      .where('subVote.user_id = vote.user_id')
                      .andWhere('subVote.voting_id = :votingId', { votingId: votingId })
                      .getQuery();
                    return 'vote.created_at = (' + subQuery + ')';
                  })
                  .groupBy('vote.option_id')
              .getRawMany();

    for (let i = 0; i < voteCounts.length; i++) {
      const voteCount = voteCounts[i];
      if (voteCount.option == VotingOption.Yes) {
        ret.yes.total_votes = voteCount.totalVotes;        
      }
      if (voteCount.option == VotingOption.No) {
        ret.no.total_votes = voteCount.totalVotes;        
      }
      if (voteCount.option == VotingOption.Abstain) {
        ret.abstain.total_votes = voteCount.totalVotes;
      }
    }
    ret.not_voted.total_votes = ret.total_members - ret.yes.total_votes - ret.no.total_votes - ret.abstain.total_votes;
    ret.quorum.percentage = 90;
    ret.quorum.total_votes = Math.round(ret.total_members * (ret.quorum.percentage / 100));
    if (ret.total_members > 0) {
      const distributedVotes : number [] = [ ret.yes.total_votes, ret.no.total_votes, ret.abstain.total_votes, ret.not_voted.total_votes ];
      let percentage = this.distributePercentages(distributedVotes, ret.total_members);
      ret.yes.percentage        = percentage[0];
      ret.no.percentage         = percentage[1];
      ret.abstain.percentage    = percentage[2];
      ret.not_voted.percentage  = percentage[3];
    }
    return ret;
  }


  private async findVoteHistory(byUser: string, votingId: string) : Promise<VoteLogEntry[]> {
    const votes = await this.voteRepository.find({
            where: { user_id: byUser, voting_id: votingId },
            order: { created_at: 'DESC' }
          });
    return votes.map(vote => {
      return {
        vote: vote.option_id,
        created_at: vote.created_at,
      }
    });
  }

  async submitBallot(ballot: VoteBallot, byUser: string, votingId: string) : Promise<VoteLogEntry[]> {
    const voteEntity = new VoteEntity();
    voteEntity.user_id = byUser;
    voteEntity.voting_id = votingId;
    voteEntity.option_id = ballot.vote;
    await this.voteRepository.save(voteEntity);

    const ret = await this.findVoteHistory(byUser, votingId);
    return ret;
  }

}
