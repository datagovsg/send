const storage = require('../storage');
const mozlog = require('../log');
const log = mozlog('send.download');
const { statDownloadEvent } = require('../amplitude');
const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = async function(req, res) {
  const id = req.params.id;

  let vaultLoggedIn = req.cookies.authtoken;
  try {
    jwt.verify(vaultLoggedIn, config.jwt_secret, {
      algorithms: ['HS256']
    });
  } catch (err) {
    console.log('No permission to download:', err);
    return res.sendStatus(401);
  }

  try {
    const meta = req.meta;
    const fileStream = await storage.get(id);
    let cancelled = false;

    req.on('close', () => {
      cancelled = true;
      fileStream.destroy();
    });

    fileStream.pipe(res).on('finish', async () => {
      if (cancelled) {
        return;
      }

      const dl = meta.dl + 1;
      const dlimit = meta.dlimit;
      const ttl = await storage.ttl(id);
      statDownloadEvent({
        cookie: req.headers.cookie,
        id,
        ip: req.ip,
        owner: meta.owner,
        download_count: dl,
        ttl,
        agent: req.ua.browser.name || req.ua.ua.substring(0, 6)
      });
      try {
        if (dl >= dlimit) {
          await storage.del(id);
        } else {
          await storage.incrementField(id, 'dl');
        }
      } catch (e) {
        log.info('StorageError:', id);
      }
    });
  } catch (e) {
    res.sendStatus(404);
  }
};
