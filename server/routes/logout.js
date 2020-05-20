module.exports = async function(req, res) {
  if (!req.session) {
    // in case they click logout on another tab, or twice
    return res.sendStatus(200);
  }

  req.session.destroy(err => {
    if (err) {
      res.sendStatus(500);
    }
  });

  delete req.session;
  res.sendStatus(200);
};
