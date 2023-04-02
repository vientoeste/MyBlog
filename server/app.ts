import 'dotenv/config';
// intended to be used with block scope
const validateEnvVars = () => {
  const RequiredEnvironmentVars = [
    'MYSQL_HOST',
    'MYSQL_ID',
    'MYSQL_PW',
    'MYSQL_DB',
    'PORT',
    'NODE_ENV',
    'MYSQL_PORT',
    'NAMESPACE_UUID',
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
import { serve, setup } from 'swagger-ui-express';
import bodyParser from 'body-parser';
import axios from 'axios';

import { CustomError } from './lib/util';
import postRouter from './controllers/post';
import { connectToDb } from './models';
import swaggerDocument from './swagger.json';

const app = http2Express(express);

connectToDb();
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/favicon.ico', express.static('build/static/favicon.ico'));

const serverOption = {
  key: undefined,
  cert: undefined,
};

app.use('/api-docs', serve, setup(swaggerDocument));

app.use(express.static(path.join(__dirname, 'build')));
app.use('/posts', postRouter);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.use('/api-proxy', async (req, res) => {
  const apiUrl = `https://localhost:${process.env.PORT as string}/api${req.url}`;
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': process.env.PRIVATE_API_KEY,
  };
  try {
    const response = await axios.get(apiUrl, { headers });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/build/index.html'));
});

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
