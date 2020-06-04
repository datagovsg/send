# Vault Send 

[![Vault Send](./assets/icon.svg)](https://send.firefox.com/)

## Local deployment guide

To deploy this project locally for development purposes, follow the steps below.

### Prerequisites

- The Vault frontend and backend must both be running before Vault Send is launched.

### Steps

1. Install the required packages: `npm install`
2. Create a `local.env` file based on the `env_example` template file
3. Run the appplication: `npm run dev`

### Note for Windows users

If you are on Windows, ensure that you are using [Git Bash](https://git-scm.com/downloads) because the `npm run` scripts contain Bash shell commands.

You will also need to configure npm to use Git Bash:  
`npm config set script-shell "C:\\Program Files\\git\\bin\\bash.exe"`

### Original Mozilla Send

Visit the original [Mozilla/Send](https://github.com/mozilla/send) repository [here](https://github.com/mozilla/send).