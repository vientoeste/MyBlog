import 'dotenv/config';
// intended to be used with block scope
const validateEnvVars = () => {
  const RequiredEnvironmentVars = [
    'PORT',
    'NODE_ENV',
    'MYSQL_HOST',
    'MYSQL_ID',
    'MYSQL_PW',
    'MYSQL_DB',
    'MYSQL_PORT',
    'NAMESPACE_UUID',
    'PRIVATE_API_KEY',
  ];
  const {
    PORT,
    NODE_ENV,
    MYSQL_HOST,
    MYSQL_ID,
    MYSQL_PW,
    MYSQL_DB,
    MYSQL_PORT,
    NAMESPACE_UUID,
    PRIVATE_API_KEY,
  } = process.env;
  const invalidParams = [
    PORT,
    NODE_ENV,
    MYSQL_HOST,
    MYSQL_ID,
    MYSQL_PW,
    MYSQL_DB,
    MYSQL_PORT,
    NAMESPACE_UUID,
    PRIVATE_API_KEY,
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
import path from 'path';
import http2 from 'http2';
import http2Express from 'http2-express-bridge';
import morgan from 'morgan';
import bodyParser from 'body-parser';

import { CustomError } from './utils';
import postRouter from './controllers/post';
import categoryRouter from './controllers/category';
import { MainPageCache, connectToDb } from './models';
import { verifyApiKey } from './middlewares';

const app = http2Express(express);

connectToDb();

export const mainPageCache = new MainPageCache();

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));

const serverOption = {
  key: undefined,
  cert: undefined,
};

app.use(verifyApiKey);

app.use('/posts', postRouter);
app.use('/categories', categoryRouter);

app.use((req: Request, _res: Response, next: NextFunction) => {
  const error = new CustomError(`Not existing router: ${req.method} ${req.url}`);
  error.status = 404;
  next(error);
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: CustomError, req: Request, res: Response, _next: NextFunction) => {
  res.locals.message = err.message;
  res.locals.error = err;
  res.status(err.status ?? 500).json({
    error: 'internal error',
  });
});

const http2Server = http2.createSecureServer(serverOption, app);

export const server = http2Server.listen(process.env.PORT);

export default app;
