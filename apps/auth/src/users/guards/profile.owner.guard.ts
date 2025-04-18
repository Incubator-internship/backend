import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ProfileOwnerGuard implements CanActivate {
  constructor() {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    //receiving postId from param (postId the same like and userID)
    const postIdFromParam = Number(request.params.id);
    console.log('request.params.id ', Number(request.params.id));
    //receiving userId from accessToken
    const userIdFromAccessToken = request.user.userId;
    console.log('request.user.userId ', request.user.userId);
    console.log(
      'postIdFromParam !== userIdFromAccessToken ',
      postIdFromParam !== userIdFromAccessToken,
    );
    if (postIdFromParam !== userIdFromAccessToken) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
