import { IUser, UserModel } from '../models/users_model';
import BaseRepo from './base_repository';

class UserRepo extends BaseRepo<IUser> {
  constructor() {
    super(UserModel);
  }
}

export default UserRepo;
