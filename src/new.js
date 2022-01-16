import bsv from 'bsv';
import { BAP } from 'bitcoin-bap';
import { BAP_PROTOCOL_ADDRESS } from "bsocial/dist/constants.js";

import { askProfileInfo, askProfileName } from './inquirer.js';
import { broadcastTransaction } from "./bitcoin.js";

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

  const ops = identity.getIdTransaction();
  const signedOps = identity.signOpReturnWithAIP(ops);

  const broadcastResult = await broadcastTransaction(profile, signedOps);
  if (!broadcastResult) {
    return
  }

  const aliasDoc = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    'alternateName': info.name || '',
    'logo': info.logo || '',
    'banner': info.banner || '',
    'homeLocation': {
      '@type': 'Place',
      'name': info.location || '',
    },
    'description': info.description || '',
    'url': info.url || '',
    'paymail': info.paymail || '',
    'bitcoinAddress': info.bitcoinAddress || '',
  };

  const aliasOps = [];
  aliasOps.push(Buffer.from(BAP_PROTOCOL_ADDRESS).toString('hex'));
  aliasOps.push(Buffer.from('ALIAS').toString('hex'));
  aliasOps.push(Buffer.from(identity.getIdentityKey()).toString('hex'));
  aliasOps.push(Buffer.from(JSON.stringify(aliasDoc)).toString('hex'));

  const aliasSignedOps = identity.signOpReturnWithAIP(aliasOps);

  const aliasBroadcastResult = await broadcastTransaction(profile, aliasSignedOps);
  if (!aliasBroadcastResult) {
    return
  }

  //console.log({ result, info, xpriv, identity, ids });
  conf.set(identity.name, profile);

  return identity.name;
};
