import {
  CanActivate,
  ExecutionContext,
  Injectable
} from '@nestjs/common'

import { Reflector } from '@nestjs/core'

import {
  ROLES_KEY
} from '@/common/decorators/roles.decorator'

import { UserRole } from '../user-role'


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector
  ) {}

  canActivate(
    context: ExecutionContext
  ): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<UserRole[]>(
        ROLES_KEY,
        [
          context.getHandler(),
          context.getClass()
        ]
      )

    // API không khai báo @Roles()
    if (!requiredRoles) {
      return true
    }

    const request =
      context.switchToHttp().getRequest()

    const user = request.user

    if (!user) {
      return false
    }

    return requiredRoles.includes(user.role)
  }
}