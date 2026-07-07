import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreateContractDto {
  @IsInt()
  institutionId: number;

  @IsInt()
  pricingModeId: number;

  @IsString()
  @IsNotEmpty()
  contractNumber: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  hourlyVolumePlanned: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice: number;
}
