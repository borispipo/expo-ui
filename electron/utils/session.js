const {app} = require('electron');
const Conf = require('./config');
const session = new Conf({cwd:app.getPath('userData')});

module.exports = session;