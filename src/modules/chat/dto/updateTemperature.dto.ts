import { IsNumber, Max, Min } from 'class-validator';

export class UpdateTemperatureReqDto {
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature: number;
}
