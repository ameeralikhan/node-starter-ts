import * as Bunyan from 'bunyan';
import * as Koa from 'koa';
import * as koaBody from 'koa-body';
import * as helmet from 'koa-helmet';
import * as mount from 'koa-mount';
import * as serve from 'koa-static';
import * as cors from 'koa2-cors';

import config from './config/index';
import pagination from './middleware/pagination';
import errorMiddleware from './middleware/error';
import response from './middleware/response';
import routes from './route/index';
import { Logger } from './utils/logger';
import compose = require('koa-compose');

const whitelist = [
  'http://localhost:4200',
  'http://localhost:3000',
  'http://localhost',
  'http://localhost:8100'
];

function checkOriginAgainstWhitelist(ctx: Koa.Context) {
  const requestOrigin = ctx.request.headers.origin || ctx.request.origin;
  if (!whitelist.includes(requestOrigin)) {
    return ctx.throw(`${requestOrigin} is not a valid origin`);
  }
  return requestOrigin;
}

export async function startServer(log: Bunyan) {
  const app = new Koa();

  app.use(Logger.koa(log));

  // Register middlewares
  // Note: It is important to have response middleware first so that it can
  // catch errors and respond accordingly.
  app.use(helmet.noCache());
  app.use(cors({ origin: checkOriginAgainstWhitelist }));
  app.use(koaBody({ jsonLimit: '10mb', formLimit: '50mb', multipart: true, json: true }));
  app.use(pagination);

  // Static files (images)
  const uploads = new Koa();
  uploads.use(serve(__dirname + '/../upload/'));
  app.use(mount('/', uploads));

  app.use(errorMiddleware());

  // Registers routes
  app.use(routes());
  app.use(response());

  return new Promise((resolve, reject) => {
    const p = process.env.PORT || config.server.port;
    app.listen(p, () => {
      log.info('server started on port %d with env=%s', p, config.env);

      resolve();
    });

    app.on('error', err => {
      reject(err);
    });
  });
}
