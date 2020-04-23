const assert = require('assert');
const crypto = require('crypto');
const storage = require('../storage');
const fxa = require('../fxa');
const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = {
  hmac: async function(req, res, next) {
    const id = req.params.id;
    const authHeader = req.header('Authorization');
    if (id && authHeader) {
      try {
        const auth = req.header('Authorization').split(' ')[1];
        const meta = await storage.metadata(id);
        if (!meta) {
          return res.sendStatus(404);
        }
        const hmac = crypto.createHmac(
          'sha256',
          Buffer.from(meta.auth, 'base64')
        );
        hmac.update(Buffer.from(meta.nonce, 'base64'));
        const verifyHash = hmac.digest();
        if (crypto.timingSafeEqual(verifyHash, Buffer.from(auth, 'base64'))) {
          req.nonce = crypto.randomBytes(16).toString('base64');
          storage.setField(id, 'nonce', req.nonce);
          res.set('WWW-Authenticate', `send-v1 ${req.nonce}`);
          req.authorized = true;
          req.meta = meta;
        } else {
          res.set('WWW-Authenticate', `send-v1 ${meta.nonce}`);
          req.authorized = false;
        }
      } catch (e) {
        req.authorized = false;
      }
    }
    if (req.authorized) {
      next();
    } else {
      res.sendStatus(401);
    }
  },
  owner: async function(req, res, next) {
    const id = req.params.id;
    const ownerToken = req.body.owner_token;
    if (id && ownerToken) {
      try {
        req.meta = await storage.metadata(id);
        if (!req.meta) {
          return res.sendStatus(404);
        }
        const metaOwner = Buffer.from(req.meta.owner, 'utf8');
        const owner = Buffer.from(ownerToken, 'utf8');
        assert(metaOwner.length > 0);
        assert(metaOwner.length === owner.length);
        req.authorized = crypto.timingSafeEqual(metaOwner, owner);
      } catch (e) {
        req.authorized = false;
      }
    }
    if (req.authorized) {
      next();
    } else {
      res.sendStatus(401);
    }
  },
  fxa: async function(req, res, next) {
    const authHeader = req.header('Authorization');
    if (authHeader && /^Bearer\s/i.test(authHeader)) {
      const token = authHeader.split(' ')[1];
      req.user = await fxa.verify(token);
    }
    return next();
  },
  vault: async function(req, res, next) {
    const redirect_uri = `${
      config.vault_frontend_url
    }/login?redirect_uri=${encodeURIComponent(
      req.protocol + '://' + req.get('host') + req.originalUrl
    )}`;
    const token = req.cookies.authtoken;
    if (!token) {
      console.log('cookie has no authtoken');
      return res.redirect(redirect_uri);
    }
    try {
      jwt.verify(token, config.jwt_secret, { algorithms: ['HS256'] });
      return next();
    } catch (err) {
      console.log('Failed jwt verification:', token);
      return res.redirect(redirect_uri);
    }
  }
};
