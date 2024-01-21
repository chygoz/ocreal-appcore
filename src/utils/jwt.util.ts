import * as jwt from 'jsonwebtoken';
import { configs } from '../configs';

export const createJwtToken = (data: any) => {
  const token = jwt.sign(data, configs.JWT_SECRET, {
    expiresIn: configs.JWT_EXIPIRY,
  });
  return token;
};

export const decodeJwtToken = (token: string) => {
  try {
    const data = jwt.verify(token, configs.JWT_SECRET);
    return data;
  } catch (error) {
    return false;
  }
};

export const createEmailJwtToken = (data: { email: string; id: string }) => {
  const token = jwt.sign(data, configs.EMAIL_JWT_SECRET, {
    expiresIn: configs.EMAIL_JWT_EXPIRY,
  });
  return token;
};

export const decodeEmailJwtToken = (token: string) => {
  try {
    const data = jwt.verify(token, configs.EMAIL_JWT_SECRET);
    return data;
  } catch (error) {
    return false;
  }
};
