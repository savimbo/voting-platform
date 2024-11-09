import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { AuthModule } from 'auth/auth.module';
import { LocalizationModule } from 'localization/localization.module';
import { PermissionModule } from 'permission/permission.module';
import { AddyModule } from 'addy/addy.module';
import { LegalEntityModule } from 'legal_entity/legal_entity.module';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { AddyService } from 'addy/addy.service';
import { LegalEntityService } from 'legal_entity/legal_entity.service';
import { LangService } from 'localization/lang.service';
import { PermissionService } from 'permission/permission.service';
import { Repository } from 'typeorm';
import { IdentityService } from 'identity/identity.service';

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  });

const mockPermissionsService = () => ({
  getGlobalPermissions: jest.fn(),
  getGlobalPermissionsForUser: jest.fn(),
  getAllGlobalRoles: jest.fn(),
  getAllGlobalPermissions: jest.fn(),
  });

  const mockService = () => ({
    });



describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<UserEntity>;
  let addyService: AddyService;
  let legalEntityService : LegalEntityService;
  let langService: LangService;
  let permissionService: PermissionService;
  let identityService: IdentityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockRepository(),
        },
        {
          provide: AddyService,
          useValue: mockService(),
        },
        {
          provide: LegalEntityService,
          useValue: mockService(),
        },
        {
          provide: LangService,
          useValue: mockService(),
        },
        {
          provide: PermissionService,
          useValue: mockPermissionsService(),
        },
      ],
    }).compile();

    repo = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    addyService = module.get<AddyService>(AddyService);
    legalEntityService = module.get<LegalEntityService>(LegalEntityService);
    langService = module.get<LangService>(LangService);
    permissionService = module.get<PermissionService>(PermissionService);   
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /*
  it('should return a user with a token', async () => {
    const result = await userService.getUserWithToken('123');
    expect(result).toEqual({
      id: '123',
      name: 'John Doe',
      token: 'mockToken',
    });
    expect(authService.generateToken).toHaveBeenCalledWith('123');
  });
  */

});
