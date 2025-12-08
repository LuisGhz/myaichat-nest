import { IsInt, Max, Min } from 'class-validator';

export class UpdateMaxTokensReqDto {
  @IsInt()
  @Min(1)
  @Max(128000)
  maxTokens: number;
}
