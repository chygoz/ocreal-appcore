import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class IsPublic implements CanActivate {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(context: ExecutionContext): boolean {
    // Your logic to determine if the route is public
    // For example, you can check if the request is targeting a public route
    return true; // Return true if the route is public, false otherwise
  }
}
