import * as PromiseFtp from 'promise-ftp';
import * as path from 'path';
import * as readdir from 'recursive-readdir';

export default ({
  dry,
  ftp,
  paths
}) => {
  const client = new PromiseFtp();

  const exit = () => process.exit(0);
  const fail = err => {
    console.error(err);
    process.exit(1);
  };

  const {
    localPath,
    remotePath
  } = paths;

  client
    .connect(ftp)
    .then(connected => {
      return readdir(path.resolve(localPath)).then(files => {
        return files.map(file => file.split(path.join(localPath, '/')).pop());
      });
    })
    .then(files => {
      const folders = files
        .filter(file => file.indexOf('/') > -1)
        .map(folder =>
          path.join(remotePath, folder.split('/').slice(0, -1).join('/'))
        )
        .filter((name, index, arr) => arr.indexOf(name) === index);

      return client
        .mkdir(remotePath, true)
        .catch(() => true)
        .then(() => {
          return Promise.all(
            folders.map(folder => client.mkdir(folder, true).catch(() => true))
          );
        })
        .then(() => files);
    })
    .then(files => {
      if (dry) {
        console.log('Dry run detected');
        console.log('Would have uploaded:')
        console.log(JSON.stringify(files, null, 2));
        return Promise.resolve(files);
      }
      return Promise.all(
        files.map(file => {
          return client.put(
            path.resolve(path.join(localPath, file)),
            path.join(remotePath, file)
          );
        })
      );
    })
    .then(exit)
    .catch(fail);
};
