import React from 'react';
import { SUFFIX } from '@/constants';

type AppSettingsProviderState = {
  App?: AppType;
};

const initialState: AppSettingsProviderState = {};

export const AppSettingsProviderContext =
  React.createContext<AppSettingsProviderState>(initialState);

export const AppSettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const App = window[SUFFIX as keyof typeof window] || {};

  return (
    <AppSettingsProviderContext.Provider
      value={{
        App,
      }}
    >
      {children}
    </AppSettingsProviderContext.Provider>
  );
};
