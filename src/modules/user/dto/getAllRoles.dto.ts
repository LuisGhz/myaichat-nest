import { Role } from '../entities';

export class GetAllRolesResDto {
  roles: Pick<Role, 'id' | 'name'>[];
}
