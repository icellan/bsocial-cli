import bsv from 'bsv';
import { BAP } from 'bitcoin-bap';

import { askProfileInfo, askProfileName } from './inquirer.js';

export const newProfile = async function (conf) {
  const profiles = Object.keys(conf.all);
  const result = await askProfileName(profiles.length);
  const info = await askProfileInfo();
  const xpriv = bsv.HDPrivateKey.fromRandom().toString();

  const bap = new BAP(xpriv);
  const identity = bap.newId();
  identity.name = result.name.replace(/[^a-z0-9_-]/ig, '_');
  Object.keys(info).forEach(key => {
    if (info[key]) {
      identity.setAttribute(key, info[key]);
    }
  });

  const ids = bap.exportIds();

  //console.log({ result, info, xpriv, identity, ids });
  conf.set(identity.name, {
    xpriv,
    ids,
  });
};
