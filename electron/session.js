const {app} = require('electron');
let Conf = require('./config');
const session = new Conf({cwd:app.getPath('userData')});

module.exports = session;