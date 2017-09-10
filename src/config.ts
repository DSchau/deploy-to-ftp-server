import * as rc from 'rc';
import * as path from 'path';

const NAME = 'deploy';

let config = rc(NAME, {
  dry: false
});

if (!config.ftp || !config.paths) {
  try {
    config = require(path.join(process.cwd(), `.${NAME}.js`));
  } catch (e) {
    const { deploy = false } = require(path.join(process.cwd(), 'package.json'));
    if (!deploy) {
      throw new Error(`A .deployrc or .deploy.js file could not be found.`);
    }
    config = deploy;
  }
}

export { config };
