const path = require('path').posix;
const fs = require('fs');

let initConfig = {};

module.exports = function Config(options) {
  const isEnvVscode = options.isEnvVscode || false;
  const rootPath = isEnvVscode ? options.root : path.join(process.cwd(), (options.root || '.'));

  if (options.configFile) {
    try {
      const jsonConfig = fs.readFileSync(
        path.resolve(process.cwd(), options.configFile, 'servino.json'), {
        encoding: 'utf8'
      });

      initConfig = JSON.parse(jsonConfig);
    } catch (error) {
      console.log(error.message);
    }
  }
  else {
    initConfig = {
      ssl: options.ssl || null,
      host: options.host || '0.0.0.0',
      port: options.port || 8125,
      root: rootPath,
      wdir: options.wdir || [rootPath],
      delay: options.delay || 200,
      ignore: options.ignore,
      inject: options.inject || true,
      open: options.open || true,
      verbose: options.verbose || true,
    }
  }

  return initConfig
}