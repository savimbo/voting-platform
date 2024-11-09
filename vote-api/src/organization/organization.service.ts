import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LegalEntityEntity } from 'legal_entity/entities/legal_entity.entity';
import { PermissionService } from 'permission/permission.service';
import { Repository } from 'typeorm';
import { SavimboUid } from 'util/savimbo-uids';
import { OrganizationMember, OrganizationMemberCreationRequest } from './dto/organization_member';
import { OrganizationMembershipEntity } from './entities/organization_membership.entity';
import { UserEntity } from 'users/entities/user.entity';
import { LegalEntity } from 'legal_entity/dto/legal_entiy';
import { OrganizationRole } from 'permission/dto/organization_role';
import { UserProfileSummary } from 'users/dto/user-profile';
import { LocalizedUniversalStatus } from 'status/dto/universal_status.dto';
import { UniversalStatusEntity } from 'status/entities/universal_status.entity';
import { UniversalStatusTxEntity } from 'status/entities/universal_status_tx.entity';
import { UsersService } from 'users/users.service';
import { EntityRoleEntity } from 'permission/entities/entity_permission.entity';
import { OrganizationMembership } from './dto/organization-membership';
import { OrganizationVoteSettingsEntity } from './entities/organization_vote_settings.entity';
import { OrganizationVoteSettings } from './dto/organization_vote_settings';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(OrganizationMembershipEntity)
    private repoMembers: Repository<OrganizationMembershipEntity>,
    @InjectRepository(OrganizationVoteSettingsEntity)
    private repoVoteSettings: Repository<OrganizationVoteSettingsEntity>,

    private userService: UsersService,
    private permissionService: PermissionService,
  ) { }


// #region Find


  async findOrganizationsOfUser(user: UserEntity) : Promise<OrganizationMembership[]> {
    const memberships = await this.repoMembers.find({ 
                                                  where: { legalEntity_id: user.legalEntity.id},
                                                  relations: {
                                                    roles: {
                                                      permissions:  true
                                                    },
                                                  },
                                                });
    const ret = memberships.map(m => OrganizationMembership.createFromEntity(m));
    return ret;                                                
  }

// #region VoteSettings

  async createVoteSettingForOrganization() : Promise<void> {
    const voteSettings = await this.repoVoteSettings.save(new OrganizationVoteSettingsEntity());
  }

  async findVoteSettingForOrganization(byUser: string) : Promise<OrganizationVoteSettings> {
    const voteSettings = await this.repoVoteSettings.findOne({ where: { id: 'org' } });
    if (!voteSettings) {
      throw new NotFoundException('vote settings not found');
    }
    return OrganizationVoteSettings.createFromEntity(voteSettings)
  }

  async updateVoteSettingForOrganization(voteSettingsParams: OrganizationVoteSettings, byUser:string) : Promise<void> {
    const voteSettings = await this.repoVoteSettings.findOne({ where: { id: 'org' } });
    if (!voteSettings) {
      throw new NotFoundException('vote settings not found');
    }
    this.validateVoteSettings(voteSettingsParams);

    const newSettings = {...voteSettings, ...voteSettingsParams}
    
    await this.repoVoteSettings.save(newSettings);
  }

  private validateVoteSettings(vs: OrganizationVoteSettings) {
    if (vs.split_direct_pctg + vs.split_group_pctg + vs.split_invest_pctg !== 100) {
      throw new UnprocessableEntityException("The sum of the split percentages must be 100");
    }
    if (!(10 <= vs.split_direct_pctg && vs.split_direct_pctg <= 30)) {
      throw new UnprocessableEntityException("The split direct percentage must be between 10 and 30");
    }
    if (0 > vs.split_group_pctg || vs.split_group_pctg > 90) {
      throw new UnprocessableEntityException("The split group percentage must be between 0 and 90");
    }
    if (0 > vs.split_invest_pctg || vs.split_invest_pctg > 90) {
      throw new UnprocessableEntityException("The split invest percentage must be between 0 and 90");
    }
    if (!(5 <= vs.delay_invest && vs.delay_invest <= 20)) {
      throw new UnprocessableEntityException("The delay invest must be between 5 and 20");
    }
    if (!(vs.vote_quorum_pctg > 0 && vs.superadmin_quorum_pctg && vs.delay_vote_days > 0 && vs.delay_cycle_months > 0)) {
      throw new UnprocessableEntityException("All vote settings must be greater than zero");
    }
  }



// #region Memberships


  async createMembership(creationData: OrganizationMemberCreationRequest, byUser: string) : Promise<OrganizationMember> {
    const newMember = new OrganizationMembershipEntity();
    newMember.id = SavimboUid.generate();
    newMember.legalEntity_id = creationData.id;
    let times = 0;
    let success = false;
    while(!success) {
      try{
        await this.repoMembers.insert(newMember);
        success = true;
      }
      catch (error: any) {
        if (error.code === '23505') { // restriccion de unicidad: retry
          newMember.id = SavimboUid.generate();
          times++;
          console.log('Error creando org membership: unique constrain. Retrying');
        }
        else {
          console.error('Error creando org membership:', error);
          throw new BadRequestException('Error creating organization');
        }
        if (times == 5) {
          console.error('Error creando org membership:', error);
          throw new ConflictException('Error creating organization membership');
        }
      } 
      //finally {  }
    }

    newMember.roles = creationData.roles.map(rol => {
          const ret = new EntityRoleEntity();
          ret.id = rol;
          return ret;
        });
    const savedMember = await this.repoMembers.save(newMember);
    const ret = new OrganizationMember();
    ret.id = savedMember.id;
    return ret;
  }

  async getNumberOrgVotingUserMembers() : Promise<number> {
    const votingRoles = await this.permissionService.getAllVotingOrgRoles();
    const memberships = await this.repoMembers
            .createQueryBuilder("membership")
            .innerJoin("membership.legalEntity", "legalEntity")  
            .innerJoin("membership.roles", "role")  
            .where("legalEntity.personality = :personality", { personality: "user" })  // Filtro por personalidad
            .andWhere("role.id IN (:...votingRoles)", { votingRoles })  
            .getMany();
    return memberships.length;
  }

  
  async getPayableMemberLegalEntities() : Promise<string[]> {
    const votingRoles = await this.permissionService.getAllVotingOrgRoles(); // ToDo cache this!
    const memberships = await this.repoMembers
            .createQueryBuilder("membership")
            .innerJoin("membership.legalEntity", "legalEntity")  
            .innerJoin("membership.roles", "role")  
            .where("role.id IN (:...votingRoles)", { votingRoles })  
            .getMany();
    const legals = memberships.map(m => m.legalEntity_id);
    return legals;
  }

  // ToDo cache this!
  async findAdminOrganizationUserMembers() : Promise<UserProfileSummary[]> {
      const adminRoles = await this.permissionService.getAllAdminOrgRoles();
      //console.log("adminRoles", adminRoles);
      const memberships = await this.repoMembers
            .createQueryBuilder("membership")
            .innerJoin("membership.legalEntity", "legalEntity")  
            .innerJoin("membership.roles", "role")  
            .where("legalEntity.personality = :personality", { personality: "user" })  // Filtro por personalidad
            .andWhere("role.id IN (:...adminRoles)", { adminRoles })  
            .getMany();
      const legals = memberships.map(m => m.legalEntity_id);
      const ret: UserProfileSummary[] = [];
      for (let i = 0; i < legals.length; i++) {
        const user = await this.userService.getUserProfileSummaryLegalEntity(legals[i]);
        ret.push(user);
      } 
      return ret;
  }

  private mapQueryResultToOrganizationMember(member: any) : OrganizationMember {
    //console.log('Mapping member: ' + JSON.stringify(member));
    const legalEntity = new LegalEntity();
    legalEntity.id = member.legal_entity_id as string;
    legalEntity.uid = member.legal_entity_uid as string;
    legalEntity.personality = member.entity_personality as string;
    if (legalEntity.personality === 'user') {
      legalEntity.person = new UserProfileSummary(); 
      legalEntity.person.id                 = member.user_id as string;
      legalEntity.person.email              = member.user_email as string;
      legalEntity.person.name_legal_first   = member.user_name_legal_first as string;
      legalEntity.person.name_legal_last    = member.user_name_legal_last as string;
      legalEntity.person.name_display_first = member.user_name_display_first as string;
      legalEntity.person.name_display_last  = member.user_name_display_last as string;
      legalEntity.person.icon_url           = member.user_icon_url as string;
    }
    legalEntity.status = new LocalizedUniversalStatus();
    legalEntity.status.id = member.status_id as number;
    legalEntity.status.localized_name = member.status_name as string;

    const roles : OrganizationRole[] = [];
    if (member.roles) {
      member.roles.forEach((role: any) => {
        const r = new OrganizationRole();
        r.id = role.id as string;
        r.name = role.name as string;
        roles.push(r);
      });
    }

    const ret = new OrganizationMember();
    ret.id = member.member_id as string;
    ret.legalEntity = legalEntity;
    ret.roles = roles;
    return ret;
  }
  

  async findAllOrganizationMembers(lang : string, byUser: string) : Promise<OrganizationMember[]> {
    const members = await this.repoMembers
      .createQueryBuilder('member')
      .leftJoin(LegalEntityEntity, 'legalEntity', 'legalEntity.id = member.legalEntity_id')
      //.leftJoin(OrganizationEntity, 'organization', 'organization.legal_entity_id = legalEntity.id')
      .leftJoin(UserEntity, 'user', 'user.legal_entity_id = legalEntity.id')
      .leftJoin(UniversalStatusEntity, 'status', 'status.id = legalEntity.status_id')
      .leftJoin(UniversalStatusTxEntity, 'statustx', 'status.id = statustx.status_id AND statustx.lang_id = :lang', { lang: lang })
      //.where('member.org_id = :orgId', { orgId: orgId })
      .select([
        'member.id AS member_id',  // alias (as) must be in lowercase! 
        'legalEntity.id AS legal_entity_id',  
        'legalEntity.uid AS legal_entity_uid',  
        'legalEntity.personality AS entity_personality',
        'user.id AS user_id',
        'user.email AS user_email',
        'user.name_legal_first AS user_name_legal_first',
        'user.name_legal_last AS user_name_legal_last',
        'user.name_display_first AS user_name_display_first',
        'user.name_display_last AS user_name_display_last',
        'user.icon_url AS user_icon_url',
        'status.id AS status_id',
        'statustx.name AS status_name', 
        // instead of a many-to-many join and manage duplicates, we get the roles as a json array
        `(SELECT json_agg(json_build_object('id', entity_role.id, 'name', entity_role.name)) 
        FROM entity_role
        INNER JOIN org_membership_entity_role ON org_membership_entity_role."entityRoleId" = entity_role.id
        WHERE org_membership_entity_role."organizationMembershipId" = member.id) AS roles`,
      ])
      //.orderBy('organization.name', 'ASC') // 'DESC'
      .getRawMany();  // Obtener los datos en bruto

    return members.map(member => {
      return this.mapQueryResultToOrganizationMember(member);
    });
 
  }

}