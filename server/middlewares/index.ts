import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../utils';

export const verifyApiKey = (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers['x-api-key'] || req.headers['x-api-key'] !== process.env.PRIVATE_API_KEY) {
    next(new CustomError('request not accepted', 403));
  }
  next();
};
