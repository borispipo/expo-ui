import chalk from 'chalk';

/**
 * Validate the environment options and apply default values.
 *
 * @param env
 * @category env
 */
export function validateEnvironment(env){
  if (typeof env.projectRoot !== 'string') {
    throw new Error(
      `@expo/webpack-config requires a valid projectRoot string value which points to the root of your project`
    );
  }
  warnEnvironmentDeprecation(env, true);
  const validModes = ['development', 'production', 'none'];
  if (!env.mode || !validModes.includes(env.mode)) {
    throw new Error(
      `@expo/webpack-config requires a valid \`mode\` string which should be one of: ${validModes.join(
        ', '
      )}`
    );
  }

  // Default to web. Allow any arbitrary platform.
  if (typeof env.platform === 'undefined') {
    env.platform = 'web';
  }
  // No https by default since it doesn't work well across different browsers and devices.
  if (typeof env.https === 'undefined') {
    env.https = false;
  }
  
  return env;
}

let warned= {};

function shouldWarnDeprecated(
  config,
  key,
  warnOnce
) {
  return (!warnOnce || !(key in warned)) && typeof config[key] !== 'undefined';
}

/**
 *
 * @param env
 * @param warnOnce
 * @category env
 * @internal
 */
export function warnEnvironmentDeprecation(env, warnOnce) {
  const warnings = {
    production: 'Please use `mode: "production"` instead.',
    development: 'Please use `mode: "development"` instead.',
    polyfill: 'Please include polyfills manually in your project.',
  };

  for (const warning of Object.keys(warnings)) {
    if (shouldWarnDeprecated(env, warning, warnOnce)) {
      warned[warning] = true;
      console.warn(
        chalk.bgYellow.black(
          `The environment property \`${warning}\` is deprecated. ${warnings[warning]}`.trim()
        )
      );
    }
  }
}

/**
 * Used for testing
 * @category env
 * @internal
 */
export function _resetWarnings() {
  warned = {};
}