const storage = require('../storage');
const mozlog = require('../log');
const log = mozlog('send.download');
const { statDownloadEvent } = require('../amplitude');

module.exports = async function(req, res) {
  const id = req.params.id;
  try {
    const meta = req.meta;
    const fileStream = await storage.get(id);
    let cancelled = false;

    req.on('close', () => {
      console.log('download request has been closed, destroying');
      cancelled = true;
      fileStream.destroy();
    });

    fileStream.pipe(res).on('finish', async () => {
      console.log('filestream pipe has finished');
      if (cancelled) {
        console.log('damn son you were cancelled');
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
        console.log('you have faced some sort of an error here', e);
        log.info('StorageError:', id);
      }
      console.log('okay the entire thing is done');
    });
  } catch (e) {
    res.sendStatus(404);
  }
};
