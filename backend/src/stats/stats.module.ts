import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from '../leads/lead.entity';
import { Opportunity } from '../opportunities/opportunity.entity';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, Opportunity])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
