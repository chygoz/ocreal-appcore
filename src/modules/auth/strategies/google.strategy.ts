import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { configs } from 'src/configs';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: configs.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: configs.GOOGLE_AUTH_CLIENT_SECRET,
      callbackURL: `${configs.google_redirect_url}/oauth-verification`,
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
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
    };

    const payload = {
      user,
      accessToken,
    };

    const authUser = await this.authService.googleValidateUser(user);
    if (!authUser) {
      throw new UnauthorizedException();
    }

    done(null, payload);
  }
}
