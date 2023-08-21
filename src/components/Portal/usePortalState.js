/***
 *  MIT License
    Copyright (c) 2020 Mo Gorhom
    @see : https://github.com/gorhom/react-native-portal
 */
import { useContext } from 'react';
import { PortalStateContext } from './context';

export const usePortalState = (hostName) => {
  const state = useContext(PortalStateContext);

  if (state === null) {
    throw new Error(
      "'PortalStateContext' cannot be null, please add 'PortalProvider' to the root component."
    );
  }

  return state[hostName] || [];
};