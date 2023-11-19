import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RequestWithUser } from 'src/types/global.types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithUser = context.switchToHttp().getRequest();

    const { authorization }: any = request.headers;

    if (!authorization || typeof authorization !== 'string') {
      throw new UnauthorizedException('Please provide a token!');
    }

    const [bearer, token] = authorization.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Please provide a valid token!');
    }

    try {
      const decodedToken = await this.jwtService.verifyAsync<{
        userId: string;
      }>(token);

      request.user = { id: decodedToken.userId };
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }

    return true;
  }
}
