/***
 *  MIT License
    Copyright (c) 2020 Mo Gorhom
    @see : https://github.com/gorhom/react-native-portal
 */
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import {uniqid}  from "$cutils";
import { usePortal } from './hooks';

const PortalComponent = ({
  name: _providedName,
  hostName,
  handleOnMount: _providedHandleOnMount,
  handleOnUnmount: _providedHandleOnUnmount,
  handleOnUpdate: _providedHandleOnUpdate,
  children,
}) => {
  //#region hooks
  const { addPortal: addUpdatePortal, removePortal } = usePortal(hostName);
  //#endregion

  //#region variables
  const name = useMemo(() => _providedName || uniqid("portal-component"), [_providedName]);
  //#endregion

  //#region refs
  const handleOnMountRef = useRef();
  const handleOnUnmountRef = useRef();
  const handleOnUpdateRef = useRef();
  //#endregion

  //#region callbacks
  const handleOnMount = useCallback(() => {
    if (_providedHandleOnMount) {
      _providedHandleOnMount(() => addUpdatePortal(name, children));
    } else {
      addUpdatePortal(name, children);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_providedHandleOnMount, addUpdatePortal]);
  handleOnMountRef.current = handleOnMount;

  const handleOnUnmount = useCallback(() => {
    if (_providedHandleOnUnmount) {
      _providedHandleOnUnmount(() => removePortal(name));
    } else {
      removePortal(name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_providedHandleOnUnmount, removePortal]);
  handleOnUnmountRef.current = handleOnUnmount;

  const handleOnUpdate = useCallback(() => {
    if (_providedHandleOnUpdate) {
      _providedHandleOnUpdate(() => addUpdatePortal(name, children));
    } else {
      addUpdatePortal(name, children);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_providedHandleOnUpdate, addUpdatePortal, children]);
  handleOnUpdateRef.current = handleOnUpdate;
  //#endregion

  //#region effects
  useEffect(() => {
    handleOnMountRef.current?.();
    return () => {
      handleOnUnmountRef.current?.();

      // remove callbacks refs
      handleOnMountRef.current = undefined;
      handleOnUnmountRef.current = undefined;
      handleOnUpdateRef.current = undefined;
    };
  }, []);
  useEffect(() => {
    handleOnUpdateRef.current?.();
  }, [children]);
  //#endregion

  return null;
};

const Portal = memo(PortalComponent);
Portal.displayName = 'Portal';


export default Portal;
