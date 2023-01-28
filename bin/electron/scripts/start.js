const { ensureElectronConfig } = require('..');

ensureElectronConfig(process.cwd());

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 1;
process.env.platform = "electron";

require('electron-webpack/out/dev/dev-runner');
