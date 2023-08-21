/***
 *  MIT License
    Copyright (c) 2020 Mo Gorhom
    @see : https://github.com/gorhom/react-native-portal
 */

import React, { memo, useReducer } from 'react';
import PortalHost from './PortalHost';
import {PortalDispatchContext,PortalStateContext} from './context';
import { INITIAL_STATE } from './constants';
import { reducer } from './reducer';

const PortalProviderComponent = ({
  rootHostName = 'root',
  shouldAddRootHost = true,
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  return (
    <PortalDispatchContext.Provider value={dispatch}>
      <PortalStateContext.Provider value={state}>
        {children}
        {shouldAddRootHost && <PortalHost name={rootHostName} />}
      </PortalStateContext.Provider>
    </PortalDispatchContext.Provider>
  );
};

const PortalProvider = memo(PortalProviderComponent);
PortalProvider.displayName = 'PortalProvider';
export default PortalProvider;