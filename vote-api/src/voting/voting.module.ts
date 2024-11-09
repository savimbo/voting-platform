import { forwardRef, Module } from '@nestjs/common';
import { VotingService } from './voting.service';
import { VotingController } from './voting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VotingEntity } from './entities/voting.entity';
import { AuthModule } from 'auth/auth.module';
import { ItemVotingEntity } from './entities/item_voting.entity';
import { VotingApprovalController } from './voting_approval.controller';
import { UsersModule } from 'users/users.module';
import { VotingApprovalEntity } from './entities/voting_approval.entity';
import { VoteEntity } from './entities/vote.entity';
import { VoteController } from './vote.controller';
import { OrganizationModule } from 'organization/organization.module';

@Module({
  imports: [TypeOrmModule.forFeature([VotingEntity, ItemVotingEntity, VotingApprovalEntity, VoteEntity]),
  forwardRef(() => AuthModule),
  UsersModule,
  OrganizationModule
],
  controllers: [VotingController, VotingApprovalController, VoteController],
  providers: [VotingService],

  exports: [VotingService],
})
export class VotingModule {}
