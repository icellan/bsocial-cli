import fs from 'fs';
import { BAP } from 'bitcoin-bap';

import { askProfileImport, askProfileName } from './inquirer.js';

export const importProfile = async function (conf) {
  const profiles = Object.keys(conf.all);
  const r = await askProfileImport(conf);
  const fileData = fs.readFileSync(r.file, 'utf8')
  let jsonData;
  try {
    jsonData = JSON.parse(fileData);
  } catch(e) {
    console.error(e);
    process.exit(-1);
  }

  if (!jsonData || !jsonData.xprv || !jsonData.ids) {
    console.error("Not a valid id import");
    process.exit(-1);
  }

  const bap = new BAP(jsonData.xprv);
  bap.importIds(jsonData.ids);

  const result = await askProfileName(profiles.length);
  result.name = result.name.replace(/[^a-z0-9_-]/ig, '_');

  conf.set(result.name, {
    xpriv: jsonData.xprv,
    ids: jsonData.ids,
  });

  return result.name;
};
