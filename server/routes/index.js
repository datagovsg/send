const crypto = require('crypto');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const uaparser = require('ua-parser-js');
const storage = require('../storage');
const config = require('../config');
const auth = require('../middleware/auth');
const language = require('../middleware/language');
const pages = require('./pages');
const filelist = require('./filelist');
const clientConstants = require('../clientConstants');
const cookieParser = require('cookie-parser');

const redisClient = require('redis').createClient(config.redis_session_url);
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

const IS_DEV = config.env === 'development';
const ID_REGEX = '([0-9a-fA-F]{10,16})';

module.exports = function(app) {
  app.set('trust proxy', true);
  app.use(helmet());
  app.use(
    helmet.hsts({
      maxAge: 31536000,
      force: !IS_DEV
    })
  );
  app.use(function(req, res, next) {
    req.ua = uaparser(req.header('user-agent'));
    next();
  });
  app.use(function(req, res, next) {
    req.cspNonce = crypto.randomBytes(16).toString('hex');
    next();
  });
  if (!IS_DEV) {
    app.use(
      helmet.contentSecurityPolicy({
        directives: {
          defaultSrc: ["'self'"],
          connectSrc: ["'self'"],
          imgSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            function(req) {
              return `'nonce-${req.cspNonce}'`;
            }
          ],
          formAction: ["'none'"],
          frameAncestors: ["'none'"],
          objectSrc: ["'none'"],
          reportUri: '/__cspreport__'
        }
      })
    );
  }
  app.use(function(req, res, next) {
    res.set('Pragma', 'no-cache');
    res.set(
      'Cache-Control',
      'private, no-cache, no-store, must-revalidate, max-age=0'
    );
    next();
  });
  app.use(bodyParser.json());
  app.use(bodyParser.text());
  app.use(cookieParser());
  // Cookies don't get sent, so that's why remove auth requirement for manifest
  app.get('/app.webmanifest', language, require('./webmanifest'));

  // heart beat too
  app.get('/__lbheartbeat__', function(req, res) {
    res.sendStatus(200);
  });

  app.get('/__heartbeat__', async (req, res) => {
    try {
      await storage.ping();
      res.sendStatus(200);
    } catch (e) {
      console.log('heartbeat failed', e);
      res.sendStatus(500);
    }
  });
  // everything else below will only be accessible with auth

  const vaultSessionMgmt = session({
    secret: config.cookie_secret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    unset: 'destroy',
    name: 'SID',
    store: new RedisStore({ client: redisClient }),
    cookie: {
      path: '/',
      domain: config.cookie_domain,
      maxAge: 20 * 60 * 1000,
      httpOnly: true,
      sameSite: true,
      secure: IS_DEV
    }
  });

  const sessionIsValid = (req, res, next) => {
    if (req.session.email) {
      return next();
    } else {
      const redirect_uri = `${config.LOGIN_URL}/login?redirect_key=${config.SEND_FRONTEND_REDIRECT_KEY}`;
      return res.redirect(redirect_uri);
    }
  };

  app.get('/', vaultSessionMgmt, sessionIsValid, language, pages.index);
  app.get('/config', function(req, res) {
    res.json(clientConstants);
  });
  app.get('/error', language, pages.blank);
  app.get('/oauth', language, pages.blank);
  app.get(
    `/download/:id${ID_REGEX}`,
    vaultSessionMgmt,
    sessionIsValid,
    language,
    pages.download
  );
  app.get('/unsupported/:reason', language, pages.unsupported);
  app.get(
    `/api/download/:id${ID_REGEX}`,
    vaultSessionMgmt,
    sessionIsValid,
    auth.hmac,
    require('./download')
  );
  app.get(
    `/api/download/blob/:id${ID_REGEX}`,
    auth.hmac,
    require('./download')
  );
  app.get(
    `/api/auth/logout`,
    vaultSessionMgmt,
    sessionIsValid,
    require('./logout')
  );
  app.get(`/api/exists/:id${ID_REGEX}`, require('./exists'));
  app.get(`/api/metadata/:id${ID_REGEX}`, auth.hmac, require('./metadata'));
  app.get('/api/filelist/:id([\\w-]{16})', auth.fxa, filelist.get);
  app.post('/api/filelist/:id([\\w-]{16})', auth.fxa, filelist.post);
  app.post('/api/upload', auth.fxa, require('./upload'));
  app.post(`/api/delete/:id${ID_REGEX}`, auth.owner, require('./delete'));
  app.post(`/api/password/:id${ID_REGEX}`, auth.owner, require('./password'));
  app.post(
    `/api/params/:id${ID_REGEX}`,
    auth.owner,
    auth.fxa,
    require('./params')
  );
  app.post(`/api/info/:id${ID_REGEX}`, auth.owner, require('./info'));
  app.post('/api/metrics', require('./metrics'));
  app.get('/__version__', function(req, res) {
    // eslint-disable-next-line node/no-missing-require
    res.sendFile(require.resolve('../../dist/version.json'));
  });
};
