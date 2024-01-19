import { Document, Schema, model } from 'mongoose';
import crypto from 'crypto';

export enum Account_type_enum {
  buyer = 'buyer',
  seller = 'seller',
}

export interface IUser extends Document {
  email: string;
  password: string;
  fullname: String;
  mobile: {
    mobile: String;
    mobileExtension: String;
    rawMobile: String;
  };
  firstname: string;
  lastname: string;
  account_type: Account_type_enum;
  address: {
    lat: number;
    lng: number;
    address: string;
    details: [];
    country: string;
    city: string;
  };
}

export interface IUserObject {
  email: IUser['email'];
  password: IUser['password'];
  fullname: IUser['fullname'];
  mobile: IUser['mobile'];
  firstname: IUser['firstname'];
  lastname: IUser['lastname'];
  account_type: IUser['account_type'];
  address: IUser['address'];
}

export interface ICreateUser {
  email: IUser['email'];
  password: IUser['password'];
  fullname: IUser['fullname'];
  mobile: IUser['mobile'];
  firstname: IUser['firstname'];
  lastname: IUser['lastname'];
  account_type: IUser['account_type'];
  address: IUser['address'];
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      unique: true,
      trim: true,
      required: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    fullname: String,
    mobile: {
      mobile: String,
      mobileExtension: String,
      rawMobile: String,
    },
    firstname: String,
    lastname: String,
    account_type: {
      type: String,
      enum: Object.values(Account_type_enum),
      required: true,
    },
    address: {
      lat: Number,
      lng: Number,
      address: String,
      details: [],
      country: String,
      city: String,
    },
  },
  { timestamps: true },
);

UserSchema.index({ email: 1 });

UserSchema.pre('save', function (next) {
  if (this?.firstname && this?.lastname) {
    this.fullname = `${this.firstname} ${this.lastname}`;
  }
  (this.password = crypto
    .createHash('md5')
    .update(this.password)
    .digest('hex')),
    next();
});

UserSchema.pre(/^update/, function (next) {
  next();
});

export const UserModel = model<IUser>('User', UserSchema);
