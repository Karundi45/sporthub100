import jwt from 'jsonwebtoken';
import { Response } from 'express';

const generateToken = (res: Response, userId: string) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });

  // Since we are building an API primarily for mobile, we will send the token in the response body.
  // For web, it would be better to set an HTTP-only cookie.
  return token;
};

export default generateToken;
