import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UsersService } from 'users/users.service';
import { IdentityService } from 'identity/identity.service';
import { JwtService } from '@nestjs/jwt';
import { PermissionService } from 'permission/permission.service';



const mockPermissionsService = () => ({
  getGlobalPermissions: jest.fn(),
  getGlobalPermissionsForUser: jest.fn(),
  getAllGlobalRoles: jest.fn(),
  getAllGlobalPermissions: jest.fn(),
  });

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let identityService : IdentityService;
  let permissionService: PermissionService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const yaServiceMock = {
      generateToken: jest.fn().mockResolvedValue('mockToken'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockPermissionsService(),
        },
        {
          provide: IdentityService,
          useValue: mockPermissionsService(),
        },
        {
          provide: PermissionService,
          useValue: mockPermissionsService(),
        },
        {
          provide: JwtService,
          useValue: yaServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    identityService = module.get<IdentityService>(IdentityService);
    permissionService = module.get<PermissionService>(PermissionService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
