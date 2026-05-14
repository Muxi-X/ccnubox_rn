import type * as ReactNavigationNative from '@react-navigation/native';
import React from 'react';

const { NavigationContext, NavigationRouteContext } =
  require('../../../node_modules/@react-navigation/native/lib/module/index.js') as typeof ReactNavigationNative;

// @ts-expect-error Re-exporting the built module keeps runtime exports aligned without Metro alias recursion.
export * from '../../../node_modules/@react-navigation/native/lib/module/index.js';

type NavigationProviderProps = {
  children?: React.ReactNode;
  navigation: unknown;
  route: unknown;
};

export function NavigationProvider({
  children,
  navigation,
  route,
}: NavigationProviderProps) {
  return (
    <NavigationContext.Provider value={navigation as any}>
      <NavigationRouteContext.Provider value={route as any}>
        {children}
      </NavigationRouteContext.Provider>
    </NavigationContext.Provider>
  );
}
