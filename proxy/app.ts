import 'dotenv/config';
// intended to be used with block scope
const validateEnvVars = () => {
  const RequiredEnvironmentVars = [
    'PORT',
    'NODE_ENV',
    'PRIVATE_API_KEY',
    'API_SERVER_URL',
  ];
  const {
    PORT,
    NODE_ENV,
    PRIVATE_API_KEY,
    API_SERVER_URL,
  } = process.env;
  const invalidParams = [
    PORT,
    NODE_ENV,
    PRIVATE_API_KEY,
    API_SERVER_URL,
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

import express from 'express';
import axios from 'axios';
import path from 'path';
import http2 from 'http2';
import http2Express from 'http2-express-bridge';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { serve, setup } from 'swagger-ui-express';

import swaggerDocument from './swagger.json';

const app = http2Express(express);

const serverOption = {
  key: undefined,
  cert: undefined,
};

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'build')));

app.use('/api-docs', serve, setup(swaggerDocument));

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.use('/api-proxy', async (req, res, next) => {
  const apiUrl = `${process.env.API_SERVER_URL as string}${req.url}`;
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'x-api-key': process.env.PRIVATE_API_KEY,
  };
  try {
    switch (req.method) {
      case 'GET':
        if (req.url === '/') next();
        const getRes = await axios.get(apiUrl, { headers });
        res.json(getRes.data);
        break;
      case 'POST':
        const postRes = await axios.post(apiUrl, req.body, { headers });
        res.json(postRes.data);
        break;
      case 'DELETE':
        const delRes = await axios.delete(apiUrl, { headers });
        res.json(delRes.data);
        break;
      case 'PUT':
        const putRes = await axios.put(apiUrl, req.body, { headers });
        res.json(putRes.data);
        break;
      case 'PATCH':
        const patchRes = await axios.patch(apiUrl, { headers });
        res.json(patchRes.data);
        break;
      default:
        res.status(400).json({ message: 'request method err' });
        break;
    }
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/build/index.html'));
});

const http2Server = http2.createSecureServer(serverOption, app);

export const server = http2Server.listen(process.env.PORT);
