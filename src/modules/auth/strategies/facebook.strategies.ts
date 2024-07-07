import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { AuthService } from '../auth.service';
import { configs } from 'src/configs';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: configs.FACEBOOK_AUTH_APP_ID,
      clientSecret: configs.FACEBOOK_AUTH_APP_SECRET,
      callbackURL: `${configs.SELF_BASE_URL}/auth/facebook/callback`,
      profileFields: ['id', 'name', 'email', 'photos', 'gender'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ): Promise<any> {
    const { name, photos } = profile;
    console.log(profile);
    const user = {
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0]?.value ?? null,
      accessToken,
      id: profile.id,
      provider: profile.provider,
    };
    const payload = {
      user,
      accessToken,
    };
    done(null, payload);
  }
}
