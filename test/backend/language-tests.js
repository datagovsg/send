const assert = require('assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

const config = {
  l10n_dev: false // prod configuration
};
const pkg = {
  availableLanguages: ['en-US', 'fr', 'it', 'es-ES']
};

function request(acceptLang) {
  return {
    headers: {
      'accept-language': acceptLang
    }
  };
}

const langMiddleware = proxyquire('../../server/middleware/language', {
  '../config': config,
  '../../package.json': pkg
});

describe('Language Middleware', function() {
  it('defaults to en-US when no header is present', function() {
    const req = request();
    const next = sinon.stub();
    langMiddleware(req, null, next);
    assert.equal(req.language, 'en-US');
    sinon.assert.calledOnce(next);
  });

  it('sets req.language to en-US when accept-language > 255 chars', function() {
    const accept = Array(257).join('a');
    assert.equal(accept.length, 256);
    const req = request(accept);
    const next = sinon.stub();
    langMiddleware(req, null, next);
    assert.equal(req.language, 'en-US');
    sinon.assert.calledOnce(next);
  });

  it('defaults to en-US when no accept-language is available', function() {
    const req = request('fa,cs,ja');
    const next = sinon.stub();
    langMiddleware(req, null, next);
    assert.equal(req.language, 'en-US');
    sinon.assert.calledOnce(next);
  });
});
