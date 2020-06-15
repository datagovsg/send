const html = require('choo/html');
const Component = require('choo/component');

class Footer extends Component {
  constructor(name, state) {
    super(name);
    this.state = state;
  }

  update() {
    return false;
  }

  createElement() {
    return html`
      <footer>
        <div class="footerContainer">
          <div class="leftFooter">
            <a
              href="${this.state.vaultFrontendUrl ||
                window.DEFAULTS.LOGIN_URL ||
                ''}/about"
              rel="noopener noreferrer"
            >
              © 2020 Open Government Products
            </a>
          </div>
          <div class="rightFooter">
            <a
              href="${this.state.vaultFrontendUrl ||
                window.DEFAULTS.LOGIN_URL ||
                '/'}"
              rel="noopener noreferrer"
            >
              <i class="bx bx-arrow-back"></i> Return to Vault
            </a>
          </div>
        </div>
      </footer>
    `;
  }
}

module.exports = Footer;
