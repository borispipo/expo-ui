import * as WebBrowser from 'expo-web-browser';
const Browser = {...WebBrowser,open:WebBrowser.openBrowserAsync,openURL:WebBrowser.openBrowserAsync};

export default Browser;