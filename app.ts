import express from 'express';
import http2 from 'http2';
import http2Express from 'http2-express-bridge';

const app = http2Express(express);

const serverOption = {
  key: undefined,
  cert: undefined,
};

export const server = http2.createSecureServer(serverOption, app);

server.listen(process.env.PORT);
