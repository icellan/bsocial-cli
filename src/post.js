import _BSocial from 'bsocial';
import { BAP } from 'bitcoin-bap';
const BSocial = _BSocial.default; // WTF?

import { APP_NAME } from './index.js'
import { askMessage } from './inquirer.js'
import { broadcastTransaction } from "./bitcoin.js";

export const post = async function (profile, message) {
  if (!message) {
    const result = await askMessage()
    message = result?.message;
  }

  if (!message) {
    console.error("No message to post");
    process.exit(-1);
  }

  const bsocial = new BSocial(APP_NAME);
  const post = bsocial.post();
  post.addText(message);
  const ops = post.getOps();

  const bap = new BAP(profile.xpriv);
  bap.importIds(profile.ids);
  const ids = bap.listIds();
  const identity = bap.getId(ids[0]); // only support for 1 id per profile now
  const signedOps = identity.signOpReturnWithAIP(ops);

  return broadcastTransaction(profile, signedOps);
};
