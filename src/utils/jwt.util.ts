import * as jwt from 'jsonwebtoken';
import { configs } from '../configs';

export const createUserJwtToken = (data: any) => {
  const token = jwt.sign(data, configs.JWT_SECRET, {
    expiresIn: 10 * 24 * 60 * 60,
  });
  return token;
};

export const createForgotPasswordJwtToken = (data: any) => {
  const token = jwt.sign(
    data,
    '4a3b5f6e8a9b3c4c9b8b7a2b8d9c5e4f7a8a8b9c0a7b3c4e9f2d5a8c6b7a2b8d9ce5a2b3c4e9f26b7a24e9f2',
    {
      expiresIn: 15 * 60,
    },
  );
  return token;
};

export const createAgentJwtToken = (data: any) => {
  const token = jwt.sign(data, configs.JWT_AGENT_SECRET, {
    expiresIn: 10 * 24 * 60 * 60,
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

export const decodeAgentJwtToken = (token: string) => {
  try {
    const data = jwt.verify(token, configs.JWT_AGENT_SECRET);
    return data;
  } catch (error) {
    return false;
  }
};

export const decodeForgotPasswordJwtToken = (token: string) => {
  try {
    const data = jwt.verify(
      token,
      '4a3b5f6e8a9b3c4c9b8b7a2b8d9c5e4f7a8a8b9c0a7b3c4e9f2d5a8c6b7a2b8d9ce5a2b3c4e9f26b7a24e9f2',
    );
    return data;
  } catch (error) {
    return false;
  }
};

export const createEmailJwtToken = (data: { email: string; id: string }) => {
  const token = jwt.sign(data, configs.EMAIL_JWT_SECRET, {
    expiresIn: 10 * 24 * 60 * 60,
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
