import type * as ReactNavigationNative from '@react-navigation/native';
import React from 'react';

// Metro aliases @react-navigation/native to this file for Harmony builds.
// Use the compiled module path here so these re-exports do not recurse back
// through the alias. This can return to a normal package import once the alias
// is no longer needed for NavigationContext/NavigationRouteContext injection.
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
