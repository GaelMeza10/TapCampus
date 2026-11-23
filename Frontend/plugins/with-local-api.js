const { withAndroidManifest, AndroidConfig } = require('expo/config-plugins');

// Preserve the existing HTTP development API in a standalone demonstration APK.
// HTTPS builds keep Android's default cleartext restriction.
module.exports = function withLocalApi(config) {
  return withAndroidManifest(config, mod => {
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(mod.modResults);
    const url = process.env.EXPO_PUBLIC_API_URL;
    if (!url || url.startsWith('http://')) application.$['android:usesCleartextTraffic'] = 'true';
    else delete application.$['android:usesCleartextTraffic'];
    return mod;
  });
};
