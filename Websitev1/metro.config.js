const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
    GOOGLE_API_KEY : "AIzaSyB6q5dTwP8s_puK-X-rF7TeIbZXm5QSJjg"
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
