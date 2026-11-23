const { withProjectBuildGradle } = require('expo/config-plugins');
const adjustment = `
// TapCampus: shorten native object paths for Windows Ninja.
if (System.getProperty('os.name').toLowerCase().contains('windows')) {
  subprojects { child ->
    ['com.android.application', 'com.android.library'].each { pluginId ->
      child.pluginManager.withPlugin(pluginId) {
        child.extensions.getByName('android').defaultConfig.externalNativeBuild.cmake.arguments.add('-DCMAKE_OBJECT_PATH_MAX=240')
        if (child.name == 'app') {
          child.extensions.getByName('android').externalNativeBuild.cmake.buildStagingDirectory = rootProject.file('../../.cxx/app')
        }
      }
    }
  }
}
`;
module.exports = config => withProjectBuildGradle(config, mod => {
  if (!mod.modResults.contents.includes('// TapCampus: shorten native object paths')) mod.modResults.contents = mod.modResults.contents.replace('apply plugin: "expo-root-project"', adjustment + '\napply plugin: "expo-root-project"');
  return mod;
});
module.exports.adjustment = adjustment;
