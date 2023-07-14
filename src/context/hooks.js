import { createContext,useContext as useReactContext } from "react";

export const ExpoUIContext = createContext(null);

export const useExpoUI = ()=> useReactContext(ExpoUIContext);

export default useExpoUI;

export const useContext = useExpoUI;

export const useApp = useContext;