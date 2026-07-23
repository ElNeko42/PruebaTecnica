import { IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';
import { OPPORTUNITY_STAGES, OpportunityStage } from '../opportunity.entity';

export class CreateOpportunityDto {
  @IsString()
  @MinLength(2)
  title: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsIn(OPPORTUNITY_STAGES)
  stage?: OpportunityStage;

  @IsInt()
  contactId: number;
}
