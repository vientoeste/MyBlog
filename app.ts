import 'dotenv/config';
// intended to be used with block scope
const validateEnvVars = () => {
  const RequiredEnvironmentVars = [
    'PORT',
    'NODE_ENV',
  ];
  const {
    PORT,
    NODE_ENV,
  } = process.env;
  const invalidParams = [
    PORT,
    NODE_ENV,
  ].map((param, index) => {
    if (typeof param === 'undefined' || param === null || param === '') {
      return RequiredEnvironmentVars[index];
    }
    return 0;
  }).filter(e => e !== 0);

  if (invalidParams.length > 0) {
    throw new Error(`missing system env params: ${invalidParams.join(', ')}`);
  }
};
validateEnvVars();

import express, { NextFunction, Request, Response } from 'express';
import http2 from 'http2';
import http2Express from 'http2-express-bridge';
import morgan from 'morgan';
import { serve, setup } from 'swagger-ui-express';
import swaggerDocument from './swagger.json';

class CustomError extends Error {
  constructor(message: string, status?: number) {
    super(message);
    Object.defineProperty(this, 'name', {
      configurable: true,
      writable: false,
      value: 'Error',
    });
    if (status) {
      this.status = status;
    }
  }

  status?: number;
}

const app = http2Express(express);

app.use(morgan('dev'));

const serverOption = {
  key: undefined,
  cert: undefined,
};

app.use('/api-docs', serve, setup(swaggerDocument));

app.use((req: Request, _res: Response, next: NextFunction) => {
  const error = new CustomError(`Not existing router: ${req.method} ${req.url}`);
  error.status = 404;
  next(error);
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: CustomError, req: Request, res: Response, _next: NextFunction) => {
  res.locals.message = err.message;
  res.locals.error = err;
  res.status(err.status ?? 500);
  res.redirect(`${req.url}/?error=${err.message}`);
});

const http2Server = http2.createSecureServer(serverOption, app);

export const server = http2Server.listen(process.env.PORT);

export default app;
