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
    fileStream.on('error', error => {
      console.log('file streaming error from S3 to server:\n', error);
    });

    req.on('close', () => {
      console.log(
        'request to download was closed, so destroying the S3 file stream'
      );
      cancelled = true;
      fileStream.destroy();
    });

    fileStream
      .pipe(res)
      .on('finish', async () => {
        if (cancelled) {
          console.log('file stream finished in cancelled state');
          return;
        }
        console.log('file stream finished');

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
      })
      .on('error', error => {
        console.log('piping to response threw us an error', error);
      });
  } catch (e) {
    res.sendStatus(404);
  }
};
