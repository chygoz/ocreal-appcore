import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AccountTypeEnum } from 'src/constants';

@Injectable()
export class AgentAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const { account_type } = request.user;
    if (account_type !== AccountTypeEnum.AGENT) {
      throw new UnauthorizedException('Unauthorized to access agent resource.');
    }
    return true;
  }
}
