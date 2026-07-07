import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateClassDto {
  @IsInt()
  institutionId: number;

  @IsString()
  @IsNotEmpty()
  classLevel: string;

  @IsInt()
  @Min(0)
  studentCount: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}
