const { withAndroidManifest } = require('@expo/config-plugins');

const READ_MEDIA_PERMISSIONS = [
  'android.permission.READ_MEDIA_IMAGES',
  'android.permission.READ_MEDIA_VIDEO',
  'android.permission.READ_MEDIA_AUDIO',
];

/**
 * Removes Android 13+ media permissions that may be automatically added by
 * dependencies. Use this when READ_EXTERNAL_STORAGE is sufficient for the app.
 */
const withRemoveReadMediaPermissions = (config) =>
  withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const existingPermissions = manifest['uses-permission'];

    if (Array.isArray(existingPermissions)) {
      manifest['uses-permission'] = existingPermissions.filter(
        (permission) => !READ_MEDIA_PERMISSIONS.includes(permission.$['android:name'])
      );
    }

    return config;
  });

module.exports = withRemoveReadMediaPermissions;
