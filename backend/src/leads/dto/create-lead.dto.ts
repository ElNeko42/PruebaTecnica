import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @MinLength(2)
  title: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  score?: number;

  @IsInt()
  contactId: number;
}
