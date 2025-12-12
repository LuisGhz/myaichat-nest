import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateUserRoleReqDto {
  @IsUUID()
  @IsNotEmpty()
  roleId: string;
}

export class UpdateUserRoleResDto {
  message: string;
}
