const assets = require('../../common/assets');

module.exports = function(req, res) {
  const manifest = {
    name: 'Vault Send',
    short_name: 'Send',
    lang: req.language,
    icons: [
      {
        src: assets.get('favicon.png'),
        type: 'image/png'
      }
    ],
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    theme_color: '#220033',
    background_color: 'white'
  };
  res.set('Content-Type', 'application/manifest+json');
  res.json(manifest);
};
