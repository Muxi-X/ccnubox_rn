import { withInfoPlist } from 'expo/config-plugins';

/**
 * Keep unused iOS permission descriptions out of generated Info.plist files.
 * This app does not use the Face ID APIs exposed by expo-secure-store.
 */
export default function removeUnusedIosPermissions(config) {
  return withInfoPlist(config, config => {
    delete config.modResults.NSFaceIDUsageDescription;
    return config;
  });
}
