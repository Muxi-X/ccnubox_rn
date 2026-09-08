const fs = require('fs');
const path = require('path');
const { createHarmonyPackageResolver } = require('expo-harmony-toolkit/metro');

process.env.EXPO_ROUTER_APP_ROOT =
  process.env.EXPO_ROUTER_APP_ROOT ?? 'src/app';

const { getDefaultConfig } = require('expo/metro-config');
const {
  createHarmonyMetroConfig,
} = require('@react-native-oh/react-native-harmony/metro.config');

const defaultConfig = getDefaultConfig(__dirname);
const harmonyConfig = createHarmonyMetroConfig({
  reactNativeHarmonyPackageName: '@react-native-oh/react-native-harmony',
});
const resolveHarmonyPackage = createHarmonyPackageResolver(
  __dirname,
  Object.fromEntries(
    [
      ['react-native-gesture-handler', 'react-native-gesture-handler'],
      ['react-native-reanimated', 'react-native-reanimated'],
      ['react-native-screens', 'react-native-screens'],
      ['@shopify/react-native-skia', 'react-native-skia'],
      ['react-native-svg', 'react-native-svg'],
    ].map(([name, suffix]) => [name, {
      source: `@harmony-js/${suffix}`,
      adapter: `@react-native-oh-tpl/${suffix}`,
    }])
  )
);
const expoHarmonyShims = {
  'expo-modules-core': path.resolve(
    __dirname,
    '.expo-harmony/shims/expo-modules-core'
  ),
  'expo-application': path.resolve(
    __dirname,
    'src/platform/harmonyExpoApplication.ts'
  ),
  'expo-clipboard': path.resolve(
    __dirname,
    '.expo-harmony/shims/expo-clipboard'
  ),
  'expo-font': path.resolve(__dirname, 'src/platform/harmonyExpoFont.ts'),
  'expo-image-picker': path.resolve(
    __dirname,
    '.expo-harmony/shims/expo-image-picker'
  ),
  'expo-image-manipulator': path.resolve(
    __dirname,
    'src/platform/harmonyExpoImageManipulator.ts'
  ),
  'expo-file-system/legacy': path.resolve(
    __dirname,
    '.expo-harmony/shims/expo-file-system/index.js'
  ),
  'expo-linear-gradient': path.resolve(
    __dirname,
    'src/platform/harmonyExpoLinearGradient.tsx'
  ),
  'jpush-react-native': path.resolve(
    __dirname,
    'node_modules/@react-native-ohos/jpush-react-native/index.js'
  ),
  'expo-updates': path.resolve(__dirname, 'src/platform/harmonyExpoUpdates.ts'),
  'expo-media-library/legacy': path.resolve(
    __dirname,
    '.expo-harmony/shims/expo-media-library/index.js'
  ),
};
const projectRootModuleAliases = {
  '@': path.resolve(__dirname, 'src'),
};
const uiStackRootModuleAliases = {
  react: path.dirname(require.resolve('@harmony-js/react/package.json')),
  '@react-native-async-storage/async-storage': path.resolve(
    __dirname,
    'node_modules/@react-native-oh-tpl/async-storage/src/index.ts'
  ),
  '@react-navigation/native': path.resolve(
    __dirname,
    'src/platform/harmonyReactNavigation/native.tsx'
  ),
  'react-native-safe-area-context': path.resolve(
    __dirname,
    'node_modules/@react-native-oh-tpl/react-native-safe-area-context/src/index.tsx'
  ),
  'react-native-screens/experimental': path.resolve(
    __dirname,
    'src/platform/harmonyScreens/index.tsx'
  ),
};
const resolvePackageAlias = (context, moduleName, platform, aliases) => {
  if (platform !== 'harmony') return null;
  for (const [aliasedModuleName, aliasedModulePath] of Object.entries(
    aliases
  )) {
    if (moduleName === aliasedModuleName) {
      return context.resolveRequest(context, aliasedModulePath, platform);
    }

    if (
      moduleName.startsWith(`${aliasedModuleName}/`) &&
      isDirectoryAlias(aliasedModulePath)
    ) {
      return context.resolveRequest(
        context,
        path.join(
          aliasedModulePath,
          moduleName.slice(aliasedModuleName.length + 1)
        ),
        platform
      );
    }
  }

  return null;
};
const isDirectoryAlias = aliasedModulePath => {
  try {
    return fs.statSync(aliasedModulePath).isDirectory();
  } catch {
    return false;
  }
};
const filterDirectoryAliases = aliases =>
  Object.fromEntries(
    Object.entries(aliases).filter(([, aliasedModulePath]) =>
      isDirectoryAlias(aliasedModulePath)
    )
  );
const resolveUiStackModuleAlias = (context, moduleName, platform) =>
  resolvePackageAlias(context, moduleName, platform, uiStackRootModuleAliases);
const resolveProjectRootModuleAlias = (context, moduleName, platform) =>
  resolvePackageAlias(context, moduleName, platform, projectRootModuleAliases);
const resolveExpoHarmonyModuleAlias = (context, moduleName, platform) =>
  resolvePackageAlias(context, moduleName, platform, expoHarmonyShims);
const extraNodeModuleAliases = {
  ...projectRootModuleAliases,
  ...filterDirectoryAliases(uiStackRootModuleAliases),
  ...filterDirectoryAliases(expoHarmonyShims),
};
const reactNativeCompatibilitySourceExts = [
  'js',
  'jsx',
  'ts',
  'tsx',
  'mjs',
  'cjs',
  'json',
];
const reactNativeCompatibilityPackageMarkers = [
  path.sep + '@react-native-oh' + path.sep + 'react-native-harmony' + path.sep,
  path.sep + 'react-native' + path.sep,
];
const findFirstExistingCompatibilityModule = (candidateBasePath, platforms) => {
  for (const candidatePlatform of platforms) {
    for (const candidateExtension of reactNativeCompatibilitySourceExts) {
      const candidatePath = candidatePlatform
        ? `${candidateBasePath}.${candidatePlatform}.${candidateExtension}`
        : `${candidateBasePath}.${candidateExtension}`;

      if (fs.existsSync(candidatePath)) {
        return { candidatePath, candidatePlatform };
      }
    }
  }

  return null;
};
const resolveReactNativeCompatibilityWrapper = (
  context,
  moduleName,
  platform
) => {
  if (
    platform !== 'harmony' ||
    !context.originModulePath ||
    !moduleName.startsWith('.')
  ) {
    return null;
  }

  const originModulePath = context.originModulePath;
  const isReactNativeCompatibilityWrapper =
    reactNativeCompatibilityPackageMarkers.some(marker =>
      originModulePath.includes(marker)
    );

  if (!isReactNativeCompatibilityWrapper) {
    return null;
  }

  const originExtension = path.extname(originModulePath);
  const originBasename = path.basename(originModulePath, originExtension);
  const candidateModulePath = path.resolve(
    path.dirname(originModulePath),
    moduleName
  );
  const candidateModuleExtension = path.extname(candidateModulePath);
  const candidateBasename = path.basename(
    candidateModulePath,
    candidateModuleExtension
  );

  const candidateBasePath = candidateModuleExtension
    ? candidateModulePath.slice(0, -candidateModuleExtension.length)
    : candidateModulePath;

  if (candidateBasename === originBasename) {
    const compatibilityWrapperCandidate = findFirstExistingCompatibilityModule(
      candidateBasePath,
      ['harmony', 'native', 'android', 'ios']
    );

    if (compatibilityWrapperCandidate) {
      return context.resolveRequest(
        context,
        compatibilityWrapperCandidate.candidatePath,
        compatibilityWrapperCandidate.candidatePlatform || platform
      );
    }

    return null;
  }

  const standardResolutionCandidate = findFirstExistingCompatibilityModule(
    candidateBasePath,
    ['harmony', 'native', '']
  );

  if (standardResolutionCandidate) {
    return null;
  }

  const compatibilityFallbackCandidate = findFirstExistingCompatibilityModule(
    candidateBasePath,
    ['android', 'ios']
  );

  if (compatibilityFallbackCandidate) {
    return context.resolveRequest(
      context,
      compatibilityFallbackCandidate.candidatePath,
      compatibilityFallbackCandidate.candidatePlatform || platform
    );
  }

  return null;
};
const resolveExpoHarmonyShim = (context, moduleName, platform) => {
  const projectRootModuleAliasResolution = resolveProjectRootModuleAlias(
    context,
    moduleName,
    platform
  );

  if (projectRootModuleAliasResolution) {
    return projectRootModuleAliasResolution;
  }

  const uiStackModuleAliasResolution = resolveUiStackModuleAlias(
    context,
    moduleName,
    platform
  );

  if (uiStackModuleAliasResolution) {
    return uiStackModuleAliasResolution;
  }

  const expoHarmonyModuleAliasResolution = resolveExpoHarmonyModuleAlias(
    context,
    moduleName,
    platform
  );

  if (expoHarmonyModuleAliasResolution) {
    return expoHarmonyModuleAliasResolution;
  }

  const harmonyPackageResolution = resolveHarmonyPackage(context, moduleName, platform);
  if (harmonyPackageResolution) return harmonyPackageResolution;

  const compatibilityWrapperResolution = resolveReactNativeCompatibilityWrapper(
    context,
    moduleName,
    platform
  );

  if (compatibilityWrapperResolution) {
    return compatibilityWrapperResolution;
  }

  const harmonyResolveRequest = harmonyConfig.resolver?.resolveRequest;

  if (typeof harmonyResolveRequest === 'function') {
    return harmonyResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = {
  ...defaultConfig,
  ...harmonyConfig,
  projectRoot: __dirname,
  server: {
    ...(defaultConfig.server ?? {}),
    ...(harmonyConfig.server ?? {}),
    unstable_serverRoot: __dirname,
  },
  transformer: {
    ...(defaultConfig.transformer ?? {}),
    ...(harmonyConfig.transformer ?? {}),
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  },
  serializer: {
    ...(defaultConfig.serializer ?? {}),
    ...(harmonyConfig.serializer ?? {}),
  },
  resolver: {
    ...(defaultConfig.resolver ?? {}),
    ...(harmonyConfig.resolver ?? {}),
    extraNodeModules: {
      ...(defaultConfig.resolver?.extraNodeModules ?? {}),
      ...(harmonyConfig.resolver?.extraNodeModules ?? {}),
      ...extraNodeModuleAliases,
    },
    resolveRequest: resolveExpoHarmonyShim,
    assetExts: (
      harmonyConfig.resolver?.assetExts ??
      defaultConfig.resolver?.assetExts ??
      []
    ).filter(ext => ext !== 'svg'),
    sourceExts: [
      'harmony.ts',
      'harmony.tsx',
      'harmony.js',
      'harmony.jsx',
      'svg',
      ...(harmonyConfig.resolver?.sourceExts ??
        defaultConfig.resolver?.sourceExts ?? [
          'ts',
          'tsx',
          'js',
          'jsx',
          'json',
        ]),
    ],
  },
};
