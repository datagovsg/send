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
            © 2020 Open Government Products - A Division of GovTech
          </div>
          <div class="rightFooter">
            <a
              href="${this.state.vaultFrontendUrl ||
                window.DEFAULTS.LOGIN_URL ||
                '/'}"
              rel="noopener noreferrer"
              >Back to Vault
              <box-icon
                color="#a7b3be"
                name="link-external"
                size="16px"
              ></box-icon>
            </a>
          </div>
        </div>
      </footer>
    `;
  }
}

module.exports = Footer;
