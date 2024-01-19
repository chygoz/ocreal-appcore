import { Duplicate_Resource_Error } from '../error_handlers/error_handlers';
import { ICreateUser } from '../models/users_model';
import UserRepo from '../repository/user_repository';

const User = new UserRepo();

export class Auth_Service {
  async create_user_account(data: ICreateUser) {
    const user = await User.findOne({
      $or: [
        {
          email: data.email.toLowerCase(),
        },
        {
          mobile: data.mobile.mobileExtension,
        },
      ],
    });
    if (user) throw new Duplicate_Resource_Error('User account exist');
    //TODO: Perform any notification actions here
    return await User.insert(data);
  }
}
