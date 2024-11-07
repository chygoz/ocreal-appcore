import { PassportStrategy } from '@nestjs/passport';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { configs } from 'src/configs';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: configs.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: configs.GOOGLE_AUTH_CLIENT_SECRET,
      callbackURL: `${process.env.LOCAL_GOOGLE_REDIRECT_URL}/v1/auth/oauth-verification`,
      scope: ['email', 'profile'],
    });
  }

  // make sure to add this or else you won't get the refresh token
  authorizationParams(): { [key: string]: string } {
    return {
      access_type: 'offline',
      prompt: 'consent',
    };
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { name, emails, photos } = profile;
      const user = {
        email: emails[0].value,
        firstname: name.givenName,
        lastname: name.familyName,
        picture: photos[0].value,
        accessToken,
      };

      const payload = { user };
      const authUser = await this.authService.googleValidateUser(payload);
      if (!authUser) {
        throw new UnauthorizedException('User not found');
      }

      done(null, payload);
    } catch (error) {
      console.error('Strategy Error:', error);
      done(new BadRequestException(error.message), false);
    }
  }
}
