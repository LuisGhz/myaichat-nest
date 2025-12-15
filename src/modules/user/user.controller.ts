import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { Admin, CurrentUser } from '@cmn/decorators';
import type { JwtPayload } from '@cmn/interfaces';
import { UserService } from './services';
import {
  GetAllRolesResDto,
  GetAllUsersResDto,
  UpdateUserRoleReqDto,
  UpdateUserRoleResDto,
} from './dto';

@Controller('user')
@Admin()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(): Promise<GetAllUsersResDto> {
    const users = await this.userService.findAll();
    return { users };
  }

  @Get('roles')
  async getAllRoles(): Promise<GetAllRolesResDto> {
    const roles = await this.userService.findAllRoles();
    return { roles };
  }

  @Patch(':id/update-role')
  async updateUserRole(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateUserRoleReqDto,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<UpdateUserRoleResDto> {
    if (currentUser.sub === userId)
      throw new BadRequestException("You can't update your own role");

    await this.userService.updateUserRole(userId, dto.roleId);
    return { message: 'User role updated successfully' };
  }
}
