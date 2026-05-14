const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase v10 uses package exports with a `react-native` condition to serve
// its RN-specific auth build (dist/rn/index.js). That build contains the
// `registerAuth` side-effect that registers the auth component before
// initializeAuth/getAuth can be called. Without these condition names Metro
// falls back to the default/esm build which skips registration, causing
// "Component auth has not been registered yet" at runtime.
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['react-native', 'require', 'default'];

module.exports = config;
