import { IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';
import { OPPORTUNITY_STAGES, OpportunityStage } from '../opportunity.entity';

export class UpdateOpportunityDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsIn(OPPORTUNITY_STAGES)
  stage?: OpportunityStage;

  @IsOptional()
  @IsInt()
  contactId?: number;
}
