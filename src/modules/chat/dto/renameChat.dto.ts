import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RenameChatReqDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;
}
