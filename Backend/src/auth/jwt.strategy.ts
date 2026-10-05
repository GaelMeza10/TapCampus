import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { isUUID } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { jwtSecret } from './jwt-secret';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret(),
      algorithms: ['HS256'],
    });
  }

  async validate(payload: { sub?: unknown }) {
    if (typeof payload.sub !== 'string' || !isUUID(payload.sub)) {
      throw new UnauthorizedException();
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true },
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
