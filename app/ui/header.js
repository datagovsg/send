const html = require('choo/html');
const Component = require('choo/component');
const Account = require('./account');
const assets = require('../../common/assets');
const { platform } = require('../utils');

class Header extends Component {
  constructor(name, state, emit) {
    super(name);
    this.state = state;
    this.emit = emit;
    this.account = state.cache(Account, 'account');
  }

  update() {
    this.account.render();
    return false;
  }

  createElement() {
    const title =
      platform() === 'android'
        ? html`
            <a class="flex flex-row items-center">
              <img src="${assets.get('icon.svg')}" />
            </a>
          `
        : html`
            <div class="flex">
              <a
                class="flex flex-row items-center"
                href="${this.state.vaultFrontendUrl ||
                  window.DEFAULTS.LOGIN_URL ||
                  '/'}"
              >
                <img
                  alt="${this.state.translate('title')}"
                  src="${assets.get('icon.svg')}"
                />
              </a>
            </div>
            <div class="main-nav flex">
              <a
                href="${this.state.vaultFrontendUrl ||
                  window.DEFAULTS.LOGIN_URL ||
                  '/'}"
              >
                <i class="bx bx-arrow-back"></i>
                <div>Return to Vault</div>
              </a>
              <a href="/vault-logout">
                <i class="bx bx-exit"></i>
                <div>Logout</div>
              </a>
            </div>
          `;
    return html`
      <header
        class="main-header relative flex-none flex flex-row w-full z-20 bg-white"
      >
        ${title} ${this.account.render()}
      </header>
    `;
  }
}

module.exports = Header;
