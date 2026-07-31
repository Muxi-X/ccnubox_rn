import React from 'react';

import { platformCapabilities } from './capabilities';

type SystemBarStyle = 'auto' | 'dark' | 'light';

let edgeToEdgeModule:
  | typeof import('react-native-edge-to-edge')
  | null
  | undefined;

const getEdgeToEdgeModule = () => {
  if (!platformCapabilities.edgeToEdge) {
    return null;
  }

  if (edgeToEdgeModule === undefined) {
    try {
      edgeToEdgeModule =
        require('react-native-edge-to-edge') as typeof import('react-native-edge-to-edge');
    } catch {
      edgeToEdgeModule = null;
    }
  }

  return edgeToEdgeModule;
};

export const PlatformSystemBars = ({ style }: { style: SystemBarStyle }) => {
  const SystemBars = getEdgeToEdgeModule()?.SystemBars;

  if (!SystemBars) {
    return null;
  }

  return <SystemBars style={style} />;
};

export const setPlatformSystemBarStyle = (
  style: Exclude<SystemBarStyle, 'auto'>
) => {
  getEdgeToEdgeModule()?.SystemBars.setStyle(style);
};
