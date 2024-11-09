
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { DatabaseVersionEntity } from './entities/database_version.entity';
import { LangEntity } from 'localization/entities/lang.entity';
import { LangTxEntity } from 'localization/entities/lang_tx.entity';
import { CountryEntity } from 'localization/entities/country.entity';
import { CountryTxEntity } from 'localization/entities/country_tx.entity';
import { CountryCallingCodeEntity } from 'localization/entities/country_calling_code.entity';
import { PhoneTypeTxEntity } from 'phone/entities/phone_type_tx.entity';
import { PhoneTypeEntity } from 'phone/entities/phone_type.entity';
import { GlobalPermissionClass, GlobalPermission, GlobalPermissionCategoryClass } from 'permission/model/global_permission.class';
import { GlobalPermissionCategoryEntity, GlobalPermissionEntity } from 'permission/entities/global_permission.entity';
import { GlobalRoleEntity } from 'permission/entities/global_role.entity';
import { StateEntity } from 'localization/entities/state.entity';
import { StateTxEntity } from 'localization/entities/state_tx.entity';
import { EntityPermissionEntity, EntityRoleEntity, EntityWithPermissionsEntity } from 'permission/entities/entity_permission.entity';
import { EntityPermissionClass, EntityWithPermissionsClass, OrganizationPermission } from 'permission/model/entity_permission.class';
import { UniversalStatusEntity } from 'status/entities/universal_status.entity';
import { UniversalStatusTxEntity } from 'status/entities/universal_status_tx.entity';
import { UniversalStatusClass } from 'status/model/universal_status.class';
import { UsersService } from 'users/users.service';
import { CreateUserRequest } from 'users/dto/create-user.input';
import { AuthenticationSystem } from 'auth/dto/authentication-system';
import { UserEntity } from 'users/entities/user.entity';
import { sampleUsers } from './sample_users_data';
import { VotingOptionClass } from 'voting/model/votio_option.class';
import { VotingOptionEntity } from 'voting/entities/voting_option.entity';
import { VotingService } from 'voting/voting.service';
import { SampleOrgData } from './sample_orgs_data';
import { OrganizationService } from 'organization/organization.service';

@Injectable()
export class InitDbService {
  private roleSystemAdmin : GlobalRoleEntity;
  private roleStaffAdmin : GlobalRoleEntity;
  private roleStaddAccounting : GlobalRoleEntity;
  private roleStaffUser : GlobalRoleEntity;
  private roleStaffRestricted : GlobalRoleEntity;
  private orgRoleAdmin : EntityRoleEntity;
  private orgRoleMember : EntityRoleEntity; 
  private userAdmin : UserEntity;
  private users: UserEntity[] = [];

  constructor(
    private readonly userService: UsersService,
    private readonly organizationService: OrganizationService,
    private readonly votingService: VotingService,
    @InjectRepository(DatabaseVersionEntity)
    private readonly databaseVersionRepository: Repository<DatabaseVersionEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(LangEntity)
    private readonly langRepository: Repository<LangEntity>,
    @InjectRepository(LangTxEntity)
    private readonly langTxRepository: Repository<LangTxEntity>,
    @InjectRepository(CountryEntity)
    private readonly countryRepository: Repository<CountryEntity>,
    @InjectRepository(CountryTxEntity)
    private readonly countryTxRepository: Repository<CountryTxEntity>,
    @InjectRepository(CountryCallingCodeEntity)
    private readonly countryCallingCodeRepository: Repository<CountryCallingCodeEntity>,
    @InjectRepository(PhoneTypeTxEntity)
    private readonly phoneTypeTxRepository: Repository<PhoneTypeTxEntity>,
    @InjectRepository(PhoneTypeEntity)
    private readonly phoneTypeRepository: Repository<PhoneTypeEntity>,
    @InjectRepository(GlobalPermissionEntity)
    private readonly globalPermissionRepository: Repository<GlobalPermissionEntity>,
    @InjectRepository(GlobalPermissionCategoryEntity)
    private readonly globalPermissionCategoryRepository: Repository<GlobalPermissionCategoryEntity>,
    @InjectRepository(EntityWithPermissionsEntity)
    private readonly entityWithPermissionsRepository: Repository<EntityWithPermissionsEntity>,
    @InjectRepository(EntityPermissionEntity)
    private readonly entityPermissionRepository: Repository<EntityPermissionEntity>,
    @InjectRepository(GlobalRoleEntity)
    private readonly globalRoleRepository: Repository<GlobalRoleEntity>,
    @InjectRepository(StateEntity)
    private readonly stateRepository: Repository<StateEntity>,
    @InjectRepository(StateTxEntity)
    private readonly stateTxRepository: Repository<StateTxEntity>,
    @InjectRepository(UniversalStatusEntity)
    private readonly universalStatusRepository: Repository<UniversalStatusEntity>,
    @InjectRepository(UniversalStatusTxEntity)
    private readonly universalStatusTxRepository: Repository<UniversalStatusTxEntity>,
    @InjectRepository(EntityRoleEntity)
    private readonly entityRoleRepository: Repository<EntityRoleEntity>,
    @InjectRepository(VotingOptionEntity)
    private readonly votingOptionsRepository: Repository<VotingOptionEntity>,
  ) {}

  async initialize() {
    const dbWasEmpty = await this.checkDatabaseVersion();

    if (dbWasEmpty) {
      await this.initializeDatabase();  // Initialize the database with default values
      await this.createSampleData();  
    }
  }
  
  private async checkDatabaseVersion(): Promise<boolean> {
    const dbVersion = await this.databaseVersionRepository.findBy({ major: MoreThanOrEqual(0) });
    if (!dbVersion || dbVersion.length === 0) {
      // Database was empty, create the initial version
      console.log('Database was empty, creating initial version');
      const newDbVersion = this.databaseVersionRepository.create({ major: 1, minor: 0, revision: 0 });
      await this.databaseVersionRepository.save(newDbVersion);
      return true;
    }{ unique: true }
  }

  private async initializeDatabase() {
    await this.createLangs();
    await this.createUniversalStatuses();
    await this.createCountries();  
    await this.createCountryCallingCodes();  
    await this.createStates();  
    await this.createPhoneTypes();
    await this.createRoles();
    await this.createVotingOptions();
    await this.createDefaultUsers(); 
    console.log("Database initialized");
  }

  private async createSampleData() {
    console.log("Creating default data");
    await this.createSampleUsers();
    await this.createSampleOrganizations();
  }

  // #region sample users
  private async createSampleUsers() {
    console.log(`Creating ${sampleUsers.length} sample users`);
    for (const grower of sampleUsers) {
      const username = grower.email.split('@')[0];
      const user = await this.userService.create(grower, "");
      this.users.push(user);
    }
  }

  private async createSampleOrganizations() {
    const orgSampler = new SampleOrgData(
              this.organizationService, this.votingService,
              this.orgRoleAdmin, this.orgRoleMember, 
              this.userAdmin, this.users            
            );
    orgSampler.createSampleOrgData();  
    
  }
// #region langs
  private async createLangLocalization(lanToTranslate: string, lan: string, translation: string) {
    let langTx = new LangTxEntity();
    langTx.lang_id_0 = lanToTranslate;
    langTx.lang_id   = lan;
    langTx.name      = translation;
    langTx.note_staff= "";
    await this.langTxRepository.save(langTx);
  }

  private async createLangs() {
    console.log("Creating langs");

    let english = new LangEntity();
    english.code_3letter      = "eng";
    english.code_2letter      = "en";
    english.id                = 1;
    english.fallback_lang_id  = "";
    english.google_code       = 0;
    english.flag_staff        = false;
    english = await this.langRepository.save(english);

    let spanish = new LangEntity();
    spanish.code_3letter      = "spa";
    spanish.code_2letter      = "es";
    spanish.id                = 2;
    spanish.fallback_lang_id  = "eng";
    spanish.google_code       = 0;
    spanish.flag_staff        = false;
    spanish = await this.langRepository.save(spanish);

    await this.createLangLocalization("eng", "eng", "English");
    await this.createLangLocalization("eng", "spa", "Inglés");
    await this.createLangLocalization("spa", "eng", "Spanish");
    await this.createLangLocalization("spa", "spa", "Español");

  }
  
  // #region admins
  private async createDefaultUsers() {
    console.log("Creating users");

    const userAdminData : CreateUserRequest = {
      authenticationBy: AuthenticationSystem.Google,
      legalFirstName: "Super",
      legalLastName: "User",
      email: "admin@savimbo.com",
      lang: "eng",
      password: "",
      token: "" 
    }
    let user = await this.userService.create(userAdminData, "");
    user.roles = [this.roleSystemAdmin];
    this.userAdmin = await this.userRepository.save(user);
  }

  private async createVotingOptions() {
    console.log("Creating voting options");

    const options = VotingOptionClass.getAllVotingOptions();
    for (const item of options) {
      await this.votingOptionsRepository.save(item);
    }
  }

  private async createUniversalStatuses() {
    console.log("Creating universal statuses");

    const statuses = UniversalStatusClass.getAllUniversalStatuses();
    for (const item of statuses) {
      await this.universalStatusRepository.save(item);
    }

    const txs : UniversalStatusTxEntity[] = [
      { status_id: 1, lang_id: "eng", name: "Created" },
      { status_id: 2, lang_id: "eng", name: "Review" },
      { status_id: 3, lang_id: "eng", name: "Test sent" },
      { status_id: 4, lang_id: "eng", name: "Approved" },
      { status_id: 5, lang_id: "eng", name: "Active" },
      { status_id: 6, lang_id: "eng", name: "Complete" },
      { status_id: 7, lang_id: "eng", name: "On hold" },
      { status_id: 8, lang_id: "eng", name: "Quit" },
      { status_id: 9, lang_id: "eng", name: "Rejected" },

      { status_id: 1, lang_id: "spa", name: "Creado" },
      { status_id: 2, lang_id: "spa", name: "Revisar" },
      { status_id: 3, lang_id: "spa", name: "Prueba enviada" },
      { status_id: 4, lang_id: "spa", name: "Aprobado" },
      { status_id: 5, lang_id: "spa", name: "Activo" },
      { status_id: 6, lang_id: "spa", name: "Completado" },
      { status_id: 7, lang_id: "spa", name: "En pausa" },
      { status_id: 8, lang_id: "spa", name: "Retiro" },
      { status_id: 9, lang_id: "spa", name: "Rechazado" },

      ];
    for (const item of txs) {
      await this.universalStatusTxRepository.save(item);
    }
    
  }

  private async createRoles() {
    console.log("Creating roles and permissions");

    const entityWithPerms = EntityWithPermissionsClass.getAllEntityWithPermissions();
    for (const item of entityWithPerms) {
      await this.entityWithPermissionsRepository.save(item);
    }

    const entityPerms = EntityPermissionClass.getAllEntityPermissions();
    for (const item of entityPerms) {
      await this.entityPermissionRepository.save(item);
    }

    const globalPermsCat = GlobalPermissionCategoryClass.getAllGlobalPermissionCategories();
    for (const item of globalPermsCat) {
      await this.globalPermissionCategoryRepository.save(item);
    }
    const globalPerms = GlobalPermissionClass.getAllGlobalPermissions();
    for (const item of globalPerms) {
      await this.globalPermissionRepository.save(item);
    }

    const roleSystemAdmin : GlobalRoleEntity = {
      id: "6NX7oVxPUm7g",
      name: "System Admin",
      description1: "",
      description2: "",
      permissions: GlobalPermissionClass.extractPermissions(globalPerms, [GlobalPermission.sys_admin_FULL])
    }
    this.roleSystemAdmin = await this.globalRoleRepository.save(roleSystemAdmin);
     
    const roleAdmin : GlobalRoleEntity = {
      id: "6NX7oVxPUa9L",
      name: "Admin",
      description1: "",
      description2: "",
      permissions: GlobalPermissionClass.extractPermissions(globalPerms, [GlobalPermission.user_profile_ADMIN, GlobalPermission.organization_ADMIN])
    }
    this.roleStaffAdmin = await this.globalRoleRepository.save(roleAdmin);

    const roleAccounting : GlobalRoleEntity = {
      id: "6NX7oVxPWgNc",
      name: "Accounting",
      description1: "",
      description2: "",
      permissions: GlobalPermissionClass.extractPermissions(globalPerms, [GlobalPermission.user_profile_MODIFY, GlobalPermission.organization_MODIFY])
    }
    this.roleStaddAccounting = await this.globalRoleRepository.save(roleAccounting);

    const roleStaffUser : GlobalRoleEntity = {
      id: "6NX7oVxPTqAW",
      name: "Staff User",
      description1: "",
      description2: "",
      permissions: GlobalPermissionClass.extractPermissions(globalPerms, [GlobalPermission.user_profile_MODIFY, GlobalPermission.organization_MODIFY])
    }
    this.roleStaffUser = await this.globalRoleRepository.save(roleStaffUser);

    const roleStaffRestricted : GlobalRoleEntity = {
      id: "6NX7oVxPVtC5",
      name: "Staff Restricted",
      description1: "",
      description2: "",
      permissions: GlobalPermissionClass.extractPermissions(globalPerms, [GlobalPermission.user_profile_VIEW, GlobalPermission.organization_VIEW])
    }
    this.roleStaffRestricted = await this.globalRoleRepository.save(roleStaffRestricted);
    
    const orgRoleAdmin : EntityRoleEntity = {
      id: "6NX7oVxPPtCa",
      name: "Organization administrator",
      entity_id: 3,
      description1: "",
      description2: "",
      permissions: EntityPermissionClass.extractPermissions(entityPerms, [OrganizationPermission.organization_ADMIN])
    }
    this.orgRoleAdmin = await this.entityRoleRepository.save(orgRoleAdmin);

    const orgRoleMember : EntityRoleEntity = {
      id: "6NX7oVxPx3aC",
      name: "Organization member",
      entity_id: 3,
      description1: "",
      description2: "",
      permissions: EntityPermissionClass.extractPermissions(entityPerms, [OrganizationPermission.organization_MEMBER])
    }
    this.orgRoleMember = await this.entityRoleRepository.save(orgRoleMember);
  }
  

  private async createStates() {
    console.log("Creating states");

    const states : StateEntity[] = [
      { code: "EC-L",   country_code_alpha3: "ECU", code_subdivision: "L" ,   state_id: 88},
      { code: "CO-ANT", country_code_alpha3: "COL", code_subdivision: "ANT" , state_id: 44},
      { code: "CO-ARA", country_code_alpha3: "COL", code_subdivision: "ARA" , state_id: 45},
      { code: "CO-ATL", country_code_alpha3: "COL", code_subdivision: "ATL" , state_id: 46},
      { code: "EC-A",   country_code_alpha3: "ECU", code_subdivision: "A",    state_id: 77},
      { code: "CO-BOL", country_code_alpha3: "COL", code_subdivision: "BOL" , state_id: 48},
      { code: "EC-B",   country_code_alpha3: "ECU", code_subdivision: "B" ,   state_id: 78},
      { code: "CO-BOY", country_code_alpha3: "COL", code_subdivision: "BOY",  state_id: 49},
      { code: "CO-CAL",   country_code_alpha3: "COL", code_subdivision: "CAL" ,   state_id: 50},
      { code: "EC-F",   country_code_alpha3: "ECU", code_subdivision: "F" ,   state_id: 79},
      { code: "CO-CAQ",   country_code_alpha3: "COL", code_subdivision: "CAQ",   state_id: 51},
      { code: "EC-C",   country_code_alpha3: "ECU", code_subdivision: "C" ,   state_id: 80},
      { code: "CO-CAS",   country_code_alpha3: "COL", code_subdivision: "CAS" ,   state_id: 52},
      { code: "CO-CAU",   country_code_alpha3: "COL", code_subdivision: "CAU" ,   state_id: 53},
      { code: "CO-CES",   country_code_alpha3: "COL", code_subdivision: "CES" ,   state_id: 54},
      { code: "EC-H",   country_code_alpha3: "ECU", code_subdivision: "H" ,   state_id: 81},
      { code: "CO-CHO",   country_code_alpha3: "COL", code_subdivision: "CHO" ,   state_id: 55},
      { code: "CO-COR",   country_code_alpha3: "COL", code_subdivision: "COR" ,   state_id: 56},
      { code: "EC-X",   country_code_alpha3: "ECU", code_subdivision: "X" ,   state_id: 82},
      { code: "CO-CUN",   country_code_alpha3: "COL", code_subdivision: "CUN" ,   state_id: 57},
      { code: "CO-DC",   country_code_alpha3: "COL", code_subdivision: "DC" ,   state_id: 47},
      { code: "EC-O",   country_code_alpha3: "ECU", code_subdivision: "O" ,   state_id: 83},
      { code: "EC-E",   country_code_alpha3: "ECU", code_subdivision: "E" ,   state_id: 84},
      { code: "EC-W",   country_code_alpha3: "ECU", code_subdivision: "W" ,   state_id: 85},
      { code: "CO-GUA",   country_code_alpha3: "COL", code_subdivision: "GUA" ,   state_id: 58},
      { code: "CO-GUV",   country_code_alpha3: "COL", code_subdivision: "GUV" ,   state_id: 59},
      { code: "EC-G",   country_code_alpha3: "ECU", code_subdivision: "G" ,   state_id: 86},
      { code: "CO-HUI",   country_code_alpha3: "COL", code_subdivision: "HUI" ,   state_id: 60},
      { code: "EC-I",   country_code_alpha3: "ECU", code_subdivision: "I" ,   state_id: 87},
      { code: "CO-LAG",   country_code_alpha3: "COL", code_subdivision: "LAG" ,   state_id: 61},
      { code: "EC-R",   country_code_alpha3: "ECU", code_subdivision: "R" ,   state_id: 89},
      { code: "CO-MAG",   country_code_alpha3: "COL", code_subdivision: "MAG" ,   state_id: 62},
      { code: "EC-M",   country_code_alpha3: "ECU", code_subdivision: "M" ,   state_id: 90},
      { code: "CO-MET",   country_code_alpha3: "COL", code_subdivision: "MET" ,   state_id: 63},
      { code: "EC-S",   country_code_alpha3: "ECU", code_subdivision: "S" ,   state_id: 91},
      { code: "EC-N",   country_code_alpha3: "ECU", code_subdivision: "N" ,   state_id: 92},
      { code: "CO-NAR",   country_code_alpha3: "COL", code_subdivision: "NAR" ,   state_id: 64},
      { code: "CO-NSA",   country_code_alpha3: "COL", code_subdivision: "NSA" ,   state_id: 65},
      { code: "EC-D",   country_code_alpha3: "ECU", code_subdivision: "D" ,   state_id: 93},
      { code: "CO-AMA",   country_code_alpha3: "COL", code_subdivision: "AMA" ,   state_id: 43},
      { code: "EC-Y",   country_code_alpha3: "ECU", code_subdivision: "Y" ,   state_id: 94},
      { code: "EC-P",   country_code_alpha3: "ECU", code_subdivision: "P" ,   state_id: 95},
      { code: "CO-PUT",   country_code_alpha3: "COL", code_subdivision: "PUT" ,   state_id: 66},
      { code: "CO-QUI",   country_code_alpha3: "COL", code_subdivision: "QUI" ,   state_id: 67},
      { code: "CO-RIS",   country_code_alpha3: "COL", code_subdivision: "RIS" ,   state_id: 68},
      { code: "CO-SAP",   country_code_alpha3: "COL", code_subdivision: "SAP" ,   state_id: 69},
      { code: "EC-SE",   country_code_alpha3: "ECU", code_subdivision: "SE" ,   state_id: 96},
      { code: "CO-SAN",   country_code_alpha3: "COL", code_subdivision: "SAN" ,   state_id: 70},
      { code: "EC-SD",   country_code_alpha3: "ECU", code_subdivision: "SD" ,   state_id: 97},
      { code: "CO-SUC",   country_code_alpha3: "COL", code_subdivision: "SUC" ,   state_id: 71},
      { code: "EC-U",   country_code_alpha3: "ECU", code_subdivision: "U" ,   state_id: 98},
      { code: "CO-TOL",   country_code_alpha3: "COL", code_subdivision: "TOL" ,   state_id: 72},
      { code: "EC-T",   country_code_alpha3: "ECU", code_subdivision: "T" ,   state_id: 99},
      { code: "CO-VAC",   country_code_alpha3: "COL", code_subdivision: "VAC" ,   state_id: 73},
      { code: "CO-VAU",   country_code_alpha3: "COL", code_subdivision: "VAU" ,   state_id: 74},
      { code: "CO-VID",   country_code_alpha3: "COL", code_subdivision: "VID" ,   state_id: 75},
      { code: "EC-Z",   country_code_alpha3: "ECU", code_subdivision: "Z" ,   state_id: 100},
      ];
      for (const item of states) {
        await this.stateRepository.save(item);
      }
    const txs : StateTxEntity[] = [
      { state_code: "EC-SD",   lang_id: "eng", name: "Santo Domingo de los Tsáchilas" },
      { state_code: "CO-SUC",   lang_id: "eng", name: "Sucre" },
      { state_code: "EC-U",   lang_id: "eng", name: "Sucumbíos" },
      { state_code: "CO-TOL",   lang_id: "eng", name: "Tolima" },
      { state_code: "EC-T",   lang_id: "eng", name: "Tungurahua" },
      { state_code: "CO-VAC",   lang_id: "eng", name: "Valle del Cauca" },
      { state_code: "CO-VAU",   lang_id: "eng", name: "Vaupés" },
      { state_code: "CO-VID",   lang_id: "eng", name: "Vichada" },
      { state_code: "EC-Z",   lang_id: "eng", name: "Zamora Chinchipe" },
      { state_code: "CO-NSA",   lang_id: "eng", name: "Norte de Santander" },
      { state_code: "EC-D",   lang_id: "eng", name: "Orellana" },
      { state_code: "CO-AMA",   lang_id: "eng", name: "Amazonas" },
      { state_code: "EC-Y",   lang_id: "eng", name: "Pastaza" },
      { state_code: "EC-P",   lang_id: "eng", name: "Pichincha" },
      { state_code: "CO-PUT",   lang_id: "eng", name: "Putumayo" },
      { state_code: "CO-QUI",   lang_id: "eng", name: "Quindío" },
      { state_code: "CO-RIS",   lang_id: "eng", name: "Risaralda" },
      { state_code: "CO-SAP",   lang_id: "eng", name: "San Andrés y Providencia" },
      { state_code: "EC-SE",   lang_id: "eng", name: "Santa Elena," },
      { state_code: "CO-SAN",   lang_id: "eng", name: "Santander" },
      { state_code: "EC-G",   lang_id: "eng", name: "Guyas" },
      { state_code: "CO-HUI",   lang_id: "eng", name: "Huila" },
      { state_code: "EC-I",   lang_id: "eng", name: "Imbabura" },
      { state_code: "CO-LAG",   lang_id: "eng", name: "La Guajira" },
      { state_code: "EC-R",   lang_id: "eng", name: "Los Ríos" },
      { state_code: "CO-MAG",   lang_id: "eng", name: "Magdalena" },
      { state_code: "EC-M",   lang_id: "eng", name: "Manabí" },
      { state_code: "CO-MET",   lang_id: "eng", name: "Meta" },
      { state_code: "EC-S",   lang_id: "eng", name: "Morona Santiago" },
      { state_code: "EC-N",   lang_id: "eng", name: "Napo" },
      { state_code: "CO-NAR",   lang_id: "eng", name: "Nariño" },
      { state_code: "CO-CHO",   lang_id: "eng", name: "Chocó" },
      { state_code: "CO-COR",   lang_id: "eng", name: "Córdoba" },
      { state_code: "EC-X",   lang_id: "eng", name: "Cotopaxi" },
      { state_code: "CO-CUN",   lang_id: "eng", name: "Cundinamarca" },
      { state_code: "CO-DC",   lang_id: "eng", name: "Bogotá" },
      { state_code: "EC-O",   lang_id: "eng", name: "El Oro" },
      { state_code: "EC-E",   lang_id: "eng", name: "Esmeraldas" },
      { state_code: "EC-W",   lang_id: "eng", name: "Galápagos" },
      { state_code: "CO-GUA",   lang_id: "eng", name: "Guainía" },
      { state_code: "CO-GUV",   lang_id: "eng", name: "Guaviare" },
      { state_code: "EC-L",   lang_id: "eng", name: "Loja" },
      { state_code: "CO-ANT", lang_id: "eng", name: "Antioquia" },
      { state_code: "CO-ARA", lang_id: "eng", name: "Arauca" },
      { state_code: "CO-ATL", lang_id: "eng", name: "Atlántico" },
      { state_code: "EC-A",   lang_id: "eng", name: "Azuay" },
      { state_code: "CO-BOL", lang_id: "eng", name: "Bolívar" },
      { state_code: "EC-B",   lang_id: "eng", name: "Bolívar" },
      { state_code: "CO-BOY", lang_id: "eng", name: "Boyacá" },
      { state_code: "CO-CAL",   lang_id: "eng", name: "Caldas" },
      { state_code: "EC-F",   lang_id: "eng", name: "Cañar" },
      { state_code: "CO-CAQ",   lang_id: "eng", name: "Caquetá" },
      { state_code: "EC-C",   lang_id: "eng", name: "Carchi" },
      { state_code: "CO-CAS",   lang_id: "eng", name: "Casanare" },
      { state_code: "CO-CAU",   lang_id: "eng", name: "Cauca" },
      { state_code: "CO-CES",   lang_id: "eng", name: "Cesar" },
      { state_code: "EC-H",   lang_id: "eng", name: "Chimborazo" },
      ///////////////////////////////////////////////////////////////////////////////////////
      { state_code: "EC-SD",   lang_id: "spa", name: "Santo Domingo de los Tsáchilas" },
      { state_code: "CO-SUC",   lang_id: "spa", name: "Sucre" },
      { state_code: "EC-U",   lang_id: "spa", name: "Sucumbíos" },
      { state_code: "CO-TOL",   lang_id: "spa", name: "Tolima" },
      { state_code: "EC-T",   lang_id: "spa", name: "Tungurahua" },
      { state_code: "CO-VAC",   lang_id: "spa", name: "Valle del Cauca" },
      { state_code: "CO-VAU",   lang_id: "spa", name: "Vaupés" },
      { state_code: "CO-VID",   lang_id: "spa", name: "Vichada" },
      { state_code: "EC-Z",   lang_id: "spa", name: "Zamora Chinchipe" },
      { state_code: "CO-NSA",   lang_id: "spa", name: "Norte de Santander" },
      { state_code: "EC-D",   lang_id: "spa", name: "Orellana" },
      { state_code: "CO-AMA",   lang_id: "spa", name: "Amazonas" },
      { state_code: "EC-Y",   lang_id: "spa", name: "Pastaza" },
      { state_code: "EC-P",   lang_id: "spa", name: "Pichincha" },
      { state_code: "CO-PUT",   lang_id: "spa", name: "Putumayo" },
      { state_code: "CO-QUI",   lang_id: "spa", name: "Quindío" },
      { state_code: "CO-RIS",   lang_id: "spa", name: "Risaralda" },
      { state_code: "CO-SAP",   lang_id: "spa", name: "San Andrés, Providencia y Santa Catalina" },
      { state_code: "EC-SE",   lang_id: "spa", name: "Santa Elena," },
      { state_code: "CO-SAN",   lang_id: "spa", name: "Santander" },
      { state_code: "EC-G",   lang_id: "spa", name: "Guyas" },
      { state_code: "CO-HUI",   lang_id: "spa", name: "Huila" },
      { state_code: "EC-I",   lang_id: "spa", name: "Imbabura" },
      { state_code: "CO-LAG",   lang_id: "spa", name: "La Guajira" },
      { state_code: "EC-R",   lang_id: "spa", name: "Los Ríos" },
      { state_code: "CO-MAG",   lang_id: "spa", name: "Magdalena" },
      { state_code: "EC-M",   lang_id: "spa", name: "Manabí" },
      { state_code: "CO-MET",   lang_id: "spa", name: "Meta" },
      { state_code: "EC-S",   lang_id: "spa", name: "Morona Santiago" },
      { state_code: "EC-N",   lang_id: "spa", name: "Napo" },
      { state_code: "CO-NAR",   lang_id: "spa", name: "Nariño" },
      { state_code: "CO-CHO",   lang_id: "spa", name: "Chocó" },
      { state_code: "CO-COR",   lang_id: "spa", name: "Córdoba" },
      { state_code: "EC-X",   lang_id: "spa", name: "Cotopaxi" },
      { state_code: "CO-CUN",   lang_id: "spa", name: "Cundinamarca" },
      { state_code: "CO-DC",   lang_id: "spa", name: "Distrito Capital de Bogotá" },
      { state_code: "EC-O",   lang_id: "spa", name: "El Oro" },
      { state_code: "EC-E",   lang_id: "spa", name: "Esmeraldas" },
      { state_code: "EC-W",   lang_id: "spa", name: "Galápagos" },
      { state_code: "CO-GUA",   lang_id: "spa", name: "Guainía" },
      { state_code: "CO-GUV",   lang_id: "spa", name: "Guaviare" },
      { state_code: "EC-L",   lang_id: "spa", name: "Loja" },
      { state_code: "CO-ANT", lang_id: "spa", name: "Antioquia" },
      { state_code: "CO-ARA", lang_id: "spa", name: "Arauca" },
      { state_code: "CO-ATL", lang_id: "spa", name: "Atlántico" },
      { state_code: "EC-A",   lang_id: "spa", name: "Azuay" },
      { state_code: "CO-BOL", lang_id: "spa", name: "Bolívar" },
      { state_code: "EC-B",   lang_id: "spa", name: "Bolívar" },
      { state_code: "CO-BOY", lang_id: "spa", name: "Boyacá" },
      { state_code: "CO-CAL",   lang_id: "spa", name: "Caldas" },
      { state_code: "EC-F",   lang_id: "spa", name: "Cañar" },
      { state_code: "CO-CAQ",   lang_id: "spa", name: "Caquetá" },
      { state_code: "EC-C",   lang_id: "spa", name: "Carchi" },
      { state_code: "CO-CAS",   lang_id: "spa", name: "Casanare" },
      { state_code: "CO-CAU",   lang_id: "spa", name: "Cauca" },
      { state_code: "CO-CES",   lang_id: "spa", name: "Cesar" },
      { state_code: "EC-H",   lang_id: "spa", name: "Chimborazo" },
      ];

    for (const item of txs) {
      await this.stateTxRepository.save(item);
    }
  }

  private async createCountries() {
    console.log("Creating countries");

    const countries : CountryEntity[] = [
      { code_alpha3: "COL", code_alpha2: "CO", country_id: 49 , code_numeric: 170, national_flag_char: "🇨🇴" },
      { code_alpha3: "ECU", code_alpha2: "EC", country_id: 65 , code_numeric: 218, national_flag_char: "🇪🇨" },
      ];
    
      for (const item of countries) {
        await this.countryRepository.save(item);
      }

    const txs : CountryTxEntity[] = [
      { country_code_alpha3: "COL", lang_id: "eng", name: "Colombia" },
      { country_code_alpha3: "ECU", lang_id: "eng", name: "Ecuador" },

      { country_code_alpha3: "COL", lang_id: "spa", name: "Colombia" },
      { country_code_alpha3: "ECU", lang_id: "spa", name: "Ecuador" },
      
      ];

    for (const item of txs) {
      await this.countryTxRepository.save(item);
    }
  }

  private async createCountryCallingCodes() {
    console.log("Creating country calling codes");

    const callingCodes : CountryCallingCodeEntity[] = [
      { code: "CO+57",  code_numeric: 57,   country_code_alpha3: "COL", id: 33 },
      { code: "EC+593", code_numeric: 593,  country_code_alpha3: "ECU", id: 159 },
      ];

    for (const item of callingCodes) {
      await this.countryCallingCodeRepository.save(item);
    }
  }

  private async createPhoneTypes() {
    console.log("Creating phone types");

    const phone_types : PhoneTypeEntity[] = [
      { uid: "cell",  id: 1},
      { uid: "whsp",  id: 2},
      { uid: "land",  id: 3}
      ];

    for (const item of phone_types) {
      await this.phoneTypeRepository.save(item);
    }

    const phoneTypeTx: PhoneTypeTxEntity[] = [
      { phone_type_uid: "cell",  lang_id: "eng", name: "Cell" },
      { phone_type_uid: "whsp",  lang_id: "eng", name: "WhatsApp" },
      { phone_type_uid: "land",  lang_id: "eng", name: "Land" },

      { phone_type_uid: "cell",  lang_id: "spa", name: "Móvil" },
      { phone_type_uid: "whsp",  lang_id: "spa", name: "WhatsApp" },
      { phone_type_uid: "land",  lang_id: "spa", name: "Fijo" },
      ];

    for (const item of phoneTypeTx) {
      await this.phoneTypeTxRepository.save(item);
    }
  }

}
