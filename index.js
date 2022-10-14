import appConfig from "$app/config";
import { registerRootComponent } from 'expo';
appConfig.current = require("./src/app.config");

require('dotenv').config();

import App from './App';

registerRootComponent(App);