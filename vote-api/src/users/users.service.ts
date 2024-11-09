import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ErrorCode } from 'constants/error-code';
import { Repository, FindOptionsWhere, InsertResult } from 'typeorm';
import { UserEntity } from 'users/entities/user.entity';
import { CreateUserRequest } from './dto/create-user.input';
import { AuthenticationSystem} from "../auth/dto/authentication-system"
import { UpdatedUserProfile, UserProfile, UserProfileSummary } from './dto/user-profile';
import { IsEmptyString } from 'util/basic-utils';
import { LangService } from 'localization/lang.service';
import { PermissionService } from 'permission/permission.service';
import { GlobalPermission, GlobalPermissionClass } from 'permission/model/global_permission.class';
import { AddyEntity } from 'addy/entities/addy.entity';
import { Address } from 'addy/dto/address';
import { AddyService } from 'addy/addy.service';
import { LegalEntityService } from 'legal_entity/legal_entity.service';
import { LegalEntityEntity } from 'legal_entity/entities/legal_entity.entity';
import { UniversalStatus } from 'status/model/universal_status.class';
import { UserSearchOrderByField, UserSearchParameters, UserSearchRequest, UserSearchResult, UserSearchResultItem } from './dto/user_search';
import { SavimboUid } from 'util/savimbo-uids';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private addyService: AddyService,
    private legalEntityService: LegalEntityService,
    private langService: LangService,
    private permissionService: PermissionService,
  ) {   }

// #region Create 

  private async ValidateCreationData(userData: CreateUserRequest) : Promise<boolean> {
    // AuthenticationSystem.EmailAndPassword: 
    //  - mecanismo anti-robots. Algo en dos pasos mandando un codigo al mail que nos pasan
    //  - validar que el password es de complejidad suficiente

    if (userData.email === null || userData.email === ""){
      throw new BadRequestException('email field is mandatory',{ description: ErrorCode.SIGNUP_REGISTER_ERROR })
      }
    if (userData.authenticationBy == AuthenticationSystem.EmailAndPassword && 
        (userData.password === null || userData.password.trim() === "")){
      throw new BadRequestException('Password is mandatory',{ description: ErrorCode.SIGNUP_REGISTER_ERROR })
      }
 
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new ForbiddenException('User already exists',{ description: ErrorCode.SIGNUP_REGISTER_ERROR })
      }
    
      return true;
  }

  // asume que si la autenticacion es por terceros el token ha sido validado 
  async create(userData: CreateUserRequest, icon:string): Promise<UserEntity> {
    await this.ValidateCreationData(userData);

    userData.email = userData.email.toLowerCase(); // normalizar el guardado de los mails, si no, el findByEmail tendria que ser case insensitive  

    let salt = "";
    let encryptedPassword = "";

    if (userData.authenticationBy == AuthenticationSystem.EmailAndPassword){
      salt = await bcrypt.genSalt(10)
      encryptedPassword = await bcrypt.hash(userData.password, salt);
    }

    const threeLetterCode = IsEmptyString(userData.lang) ? "eng" : userData.lang;
    const lang = await this.langService.findOneBy3LetterCode(userData.lang);
    if (!lang){
      throw new BadRequestException('Invalid language',{ description: ErrorCode.SIGNUP_REGISTER_ERROR })
    }

    const addy = await this.addyService.upsertAddy(new AddyEntity());
    const legal = await this.legalEntityService.createLegalEntity(LegalEntityEntity.createUserLegalEntity(UniversalStatus.Active));
    //console.log('Creating user legal entity 55:', legal);
    const newUser = new UserEntity();
    newUser.id                = legal.id; //SavimboUid.generate();
    newUser.email             = userData.email; // get(userData, 'email', null);
    newUser.name_legal_first  = userData.legalFirstName; // get(userData, 'legalFirstName', null);
    newUser.name_legal_last   = userData.legalLastName;  //  get(userData, 'legalLastName', null);
    newUser.name_display_first= userData.legalFirstName; 
    newUser.name_display_last = userData.legalLastName; 
    newUser.icon_url          = icon;
    newUser.authSystem        = userData.authenticationBy;
    newUser.pwdsalt           = salt;
    newUser.pwdhas            = encryptedPassword;
    newUser.lang_id           = lang.code_3letter;
    newUser.addy              = addy;
    newUser.legalEntity       = legal; 

    //SavimboUid.database_insert(this.userRepository, newUser, "user");
    
    let times = 0;
    let success = false;
    while(!success) {
      try{
        await this.userRepository.insert(newUser);
        success = true;
      }
      catch (error: any) {
        if (error.code === '23505') { // restriccion de unicidad: retry
          newUser.id = SavimboUid.generate();
          times++;
          console.log('Error creando user: unique constrain. Retrying');
          throw new ConflictException('Error creating user'); // we are assuming that userId == legalId
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
    
    //return this.findById(newUser.id);
    /// ----
    const ret = await this.userRepository.save(newUser);  // to save the relations
    return ret;
  }


// #region Check rights

  private async checkPermissionAccess(forUser: string, byUser: string, permsNeeded: string[]): Promise<boolean> {
    if (byUser !== forUser) {
      const byUserPerms = await this.permissionService.getGlobalPermissionsForUser(byUser); 
      if (!GlobalPermissionClass.contains(byUserPerms, permsNeeded)) {   
        throw new ForbiddenException('Insufficient rights to access this user data');
      }
    }
    return true;
  }

  private async checkWriteAccess(id: string, byUser: string): Promise<boolean> {
    const accessOk = await this.checkPermissionAccess(id, byUser, [ 
                                                        GlobalPermission.sys_admin_FULL,
                                                        GlobalPermission.user_profile_ADMIN,
                                                        GlobalPermission.user_profile_MODIFY,
                                                      ]);
    return accessOk;
  }

  private async checkReadAccess(id: string, byUser: string): Promise<boolean> {
    const accessOk = await this.checkPermissionAccess(id, byUser, [ 
                                                        GlobalPermission.sys_admin_FULL,
                                                        GlobalPermission.user_profile_ADMIN,
                                                        GlobalPermission.user_profile_MODIFY,
                                                        GlobalPermission.user_profile_VIEW
                                                      ]);
    return accessOk;
  }

  // #region Update
  private updateUserEntityFromUserProfile(userEntity : UserEntity, userProfile : UserProfile, updatedBy : string) {
    if (!IsEmptyString(userProfile.name_legal_first)){
      userEntity.name_legal_first = userProfile.name_legal_first;
    }
    if (!IsEmptyString(userProfile.name_legal_last)){
      userEntity.name_legal_last = userProfile.name_legal_last;
    }
    if (!IsEmptyString(userProfile.name_display_first)){
      userEntity.name_display_first = userProfile.name_display_first;
    }
    if (!IsEmptyString(userProfile.name_display_last)){
      userEntity.name_display_last = userProfile.name_display_last;
    }
    userEntity.updated_by = updatedBy;
    userEntity.updatedAt  = new Date()
    //lang_id
    //gender_id

  }

  async updateUser(userProfile : UserProfile, updatedBy : string) : Promise<UpdatedUserProfile> {
    await this.checkReadAccess(userProfile.id, updatedBy);
    const userEntity = await this.findById(userProfile.id);
    if (!userEntity) {
      throw new NotFoundException('User not found');
    }
    this.updateUserEntityFromUserProfile(userEntity, userProfile, updatedBy);
    await this.userRepository.save(userEntity);
    
    const ret : UpdatedUserProfile = {
      userProfile: userProfile,
      access_token: ""
    }
    return ret;
  }

  // #region Find
  async findUser(id: string, byUser: string, relations: string[] = []): Promise<UserEntity> {
    await this.checkReadAccess(id, byUser);
    if (relations.length === 0) {
      relations = ['legalEntity']; 
    }
    //return await this.userRepository.findOneBy({ id: id });
    return await this.userRepository.findOne({
                                        where: { id: id }, 
                                        relations: relations 
                                        });
  }

  private async findById(id: string): Promise<UserEntity> {
    return await this.userRepository.findOneBy({ id: id });
  }

  async findByEmail(email: string): Promise<UserEntity> {
    let mail = email.toLowerCase();  // asi los guardamos en la DB
    //return await this.userRepository.findOneBy({ email: `${mail}` });
    return await this.userRepository.findOne({
                                          where: { email: `${mail}` }
                                          });
  }

  async getUserProfileSummary(userId: string) : Promise<UserProfileSummary> {
    const userEntity = await this.findById(userId)
    if (!userEntity) {
      return null;
    }
    return UserProfileSummary.createFromUserEntity(userEntity); 
  }

 
  // #region Search

  private async populateSearchResultItem(userEntity: UserEntity): Promise<UserSearchResultItem> {
      let ret = new UserSearchResultItem();
      ret.id                  = userEntity.id;
      ret.email               = userEntity.email;
      ret.name_legal_first    = userEntity.name_legal_first;
      ret.name_legal_last     = userEntity.name_legal_last;
      ret.name_display_first  = userEntity.name_display_first;
      ret.name_display_last   = userEntity.name_display_last;
      ret.createdAt           = userEntity.createdAt;
      ret.flagged             = userEntity.flagged_by_staff;
      ret.icon_url            = userEntity.icon_url;
      ret.address             = await this.addyService.AddressFromFullyPopulatedAddyEntity(userEntity.addy, userEntity.lang_id);
      ret.status              =  { id: userEntity.legalEntity.status.id,
                                  localized_name: this.langService.getTranslation(userEntity.legalEntity.status.tx, userEntity.lang_id)
                                  }
      return ret;
  }


  private async populateSearchResult(userEntities: UserEntity[]): Promise<UserSearchResult> {
    const ret = new UserSearchResult();

    for (let i = 0; i < userEntities.length; i++) {
      const userEntity = userEntities[i];
      const item = await this.populateSearchResultItem(userEntity);
      ret.users.push(item);
    }

    return ret;
  }

  async searchUsers2(params: UserSearchRequest, byUser: string): Promise<UserSearchResult> {
    await this.checkReadAccess("", byUser);
    const found = await this.userRepository.find( {
        relations: {
          addy : {
            state : {
              tx: true,
            },
            country : {
              tx: true,
            },
          },
          legalEntity : {
            status : {
              tx: true,
            },
          }
        },
      });
    return this.populateSearchResult(found);
  }

  private getOrderByField(orderBy: UserSearchOrderByField): string {
    switch (orderBy) {
      case UserSearchOrderByField.CREATED_AT:
        return 'user.createdAt';
      case UserSearchOrderByField.EMAIL:
        return 'user.email';
      case UserSearchOrderByField.NAME_DISPLAY_LAST:
        return 'user.name_display_last';
      case UserSearchOrderByField.NAME_LEGAL_LAST:
        return 'user.name_legal_last';
      default:
        return 'user.createdAt';
    }
  }

  async searchUsers(params: UserSearchRequest, byUser: string): Promise<UserSearchResult> {
    await this.checkReadAccess("", byUser);
    let skip = 0; // (page - 1) * pageSize;
    let take = 20; // pageSize;
    let orderField = UserSearchOrderByField.CREATED_AT;
    let orderAsc = false;

    if (params && params.pagination) {
      console.log('Search parameters: ' + JSON.stringify(params.pagination));
      skip = (params.pagination.page - 1) * params.pagination.per_page;
      take = params.pagination.per_page;
    }
    if (params && params.order) {
      orderField = params.order.field;
      orderAsc = params.order.ascendent;
    }

    const queryBuilder = this.userRepository.createQueryBuilder('user')
        // relations
        .leftJoinAndSelect('user.addy', 'addy')
        .leftJoinAndSelect('addy.state', 'state')
        .leftJoinAndSelect('state.tx', 'stateTx')
        .leftJoinAndSelect('addy.country', 'country')
        .leftJoinAndSelect('country.tx', 'countryTx')
        .leftJoinAndSelect('user.legalEntity', 'legalEntity')
        .leftJoinAndSelect('legalEntity.status', 'status')
        .leftJoinAndSelect('status.tx', 'statusTx')
        // pagination
        .skip(skip)
        .take(take)
        // order by
        .orderBy(this.getOrderByField(orderField), orderAsc ? 'ASC' : 'DESC');

    // Obtener los resultados y el total de registros
    const [found, total] = await queryBuilder.getManyAndCount();

    const ret = await this.populateSearchResult(found);
    ret.total = total;

    return ret;
}


  // #region Address
  async findAddyForUser(lang : string, forUser: string, byUser: string) : Promise<Address> {
    await this.checkReadAccess(forUser, byUser);
    const userEntity = await this.userRepository.findOne({ where: { id: forUser}, 
                                                          relations: ['addy'] });
    if (!userEntity) {
      throw new NotFoundException('User not found');
    }
    if (!userEntity.addy) {
      throw new NotFoundException('User has no address');
    }

    const address = await this.addyService.AddressFromAddyEntity(userEntity.addy, lang);
    return address;
  }


  async updateAddyForUser(addyData: Address, lang: string, forUser: string, byUser:string) : Promise<Address> {
    await this.checkWriteAccess(forUser, byUser);
    const userEntity = await this.userRepository.findOne({ where: { id: forUser}, 
                                                          relations: ['addy'] });
    if (!userEntity) {
      throw new NotFoundException('User not found');
    }
    if (!userEntity.addy) {
      throw new NotFoundException('User has no address');
    }
    if (addyData.id !== userEntity.addy.id) {
      console.log(`Address: ${addyData.id} - user ${userEntity.addy.id}`);
      throw new BadRequestException('Address Id mismatch');
    }
    await this.addyService.updateAddyEntityFromAddress(addyData);
    return addyData;
  }

  // #region Legal Entity
  async getUserLegalEntity(userId: string) : Promise<LegalEntityEntity> {
    const userEntity = await this.userRepository.findOne({ where: { id: userId}, 
                                                          relations: ['legalEntity'] });
    if (!userEntity) {
      throw new NotFoundException('User not found');
    }
    return userEntity.legalEntity;                                                          
  }

  async getUserByLegalEntity(legalId: string) : Promise<UserEntity> {
    const userEntity = await this.userRepository.findOne({ where: { legalEntity: {id: legalId}}});
    if (!userEntity) {
      return null;
    }
    return userEntity; 
  }

  async getUserProfileSummaryLegalEntity(legalId: string) : Promise<UserProfileSummary> {
    const userEntity = await this.userRepository.findOne({ where: { legalEntity: {id: legalId}}});
    if (!userEntity) {
      return null;
    }
    return UserProfileSummary.createFromUserEntity(userEntity); 
  }

  
 

};

