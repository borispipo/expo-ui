// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import NetworkLogger from 'react-native-network-logger';
import theme from "$theme";

const NetworkLoginScreen = () => <NetworkLogger 
    theme={theme.isDark()?"dark":undefined}
/>;

NetworkLoginScreen.displayName = "NetworkLogin";
NetworkLoginScreen.authRequired = false;

export default NetworkLoginScreen;
