import React from "$react";

export const PreferencesContext = React.createContext(null);

export const usePreferences = x => React.useContext(PreferencesContext);