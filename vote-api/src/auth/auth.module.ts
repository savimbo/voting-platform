import { forwardRef, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthController } from 'auth/auth.controllers';
import { AuthService } from 'auth/auth.service';
import { OrganizationModule } from 'organization/organization.module';
import { PermissionModule } from 'permission/permission.module';
import { UsersModule } from 'users/users.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.register({
      signOptions: { expiresIn: "1d" },
      secret: 'CHANGE_THIS_SECRET', 
    }),
    PermissionModule,
    OrganizationModule
  ],
  controllers: [AuthController],
  providers:   [AuthService],
  exports: [JwtModule],
})
export class AuthModule { }
