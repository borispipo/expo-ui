// Copyright 2022 @fto-consult/Boris Fouomene. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import NetworkLogger from 'react-native-network-logger';
import theme from "$theme";
import Screen from "$elayouts/Screen/ScreenWithOrWithoutAuthContainer";

const NetworkLoginScreen = () => <Screen withScrollView title="Débuggin du réseau" subtitle = {false}>
    <NetworkLogger 
        theme={theme.isDark()?"dark":undefined}
    />
</Screen>;

NetworkLoginScreen.displayName = "NetworkLogin";
NetworkLoginScreen.authRequired = false;
NetworkLoginScreen.Modal = true;

export default NetworkLoginScreen;
