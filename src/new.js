import bsv from 'bsv';
import { BAP } from 'bitcoin-bap';
import { getSignedAliasOps } from "./profile.js";

import { askProfileInfo, askProfileName, askWaitFunding } from './inquirer.js';
import { broadcastTransaction, getBalance } from "./bitcoin.js";
import { loadSats } from "./sats.js";


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
  const profile = {
    xpriv,
    ids,
  };

  console.log("Please fund this address to be able to create the on-chain profile.\n");
  loadSats(profile);

  while (1) {
    let balance = await getBalance(profile);
    if (balance > 500) {
      break;
    }
    const waitResult = await askWaitFunding();
    if (waitResult.selected === 'cancel') {
      return;
    }
  }

  const ops = identity.getIdTransaction();
  const broadcastResult = await broadcastTransaction(profile, ops);
  if (!broadcastResult) {
    return
  }

  //console.log({ result, info, xpriv, identity, ids });
  conf.set(identity.name, profile);
  const aliasSignedOps = getSignedAliasOps(info, identity);

  const aliasBroadcastResult = await broadcastTransaction(profile, aliasSignedOps);
  if (!aliasBroadcastResult) {
    return
  }

  return identity.name;
};
