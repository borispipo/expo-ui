/***
 *  MIT License
    Copyright (c) 2020 Mo Gorhom
    @see : https://github.com/gorhom/react-native-portal
 */
import React, { memo, useEffect } from 'react';
import { usePortal,usePortalState} from './hooks';

const PortalHostComponent = ({ name }) => {
  const state = usePortalState(name);
  const { registerHost, deregisterHost } = usePortal(name);

  //#region effects
  useEffect(() => {
    registerHost();
    return () => {
      deregisterHost();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //#endregion

  //#region render
  return <>{state.map(item => item.node)}</>;
  //#endregion
};

const PortalHost = memo(PortalHostComponent);
PortalHost.displayName = 'PortalHost';

export default PortalHost;
