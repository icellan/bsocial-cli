import _BSocial from 'bsocial';
import { BAP } from 'bitcoin-bap';
import bsv from 'bsv';
import fetch from 'node-fetch';
const BSocial = _BSocial.default; // WTF?

import { askMessage } from './inquirer.js'
import { getUtxos, getTx, getKeys } from './bitcoin.js';
import { DEBUG } from "./index.js";

const appName = 'bsocial.cli';

export const post = async function (profile, message) {
  if (!message) {
    const result = await askMessage()
    message = result?.message;
  }

  if (!message) {
    console.error("No message to post");
    process.exit(-1);
  }

  const bsocial = new BSocial(appName);
  const post = bsocial.post();
  post.addText(message);
  const ops = post.getOps();

  const bap = new BAP(profile.xpriv);
  bap.importIds(profile.ids);
  const ids = bap.listIds();
  const identity = bap.getId(ids[0]); // only support for 1 id per profile now

  const { privateKey, address } = getKeys(profile);

  const utxos = await getUtxos(profile);
  const txUtxos = [];
  for (let i = 0; i < utxos.length; i++) {
    const u = utxos[i];
    const txHex = await getTx(u.tx_hash);
    const uTx = new bsv.Transaction();
    uTx.fromString(txHex);
    const output = uTx.outputs[u.tx_pos].toObject();
    txUtxos.push({
      txid: u.tx_hash,
      vout: Number(u.tx_pos),
      satoshis: Number(output.satoshis),
      scriptPubKey: output.script,
    });
  }

  const signedOps = identity.signOpReturnWithAIP(ops);
  const opReturnHex = signedOps.map(o => Buffer.from(o, 'hex'));

  const tx = new bsv.Transaction();
  tx.from(txUtxos);
  tx.change(address);
  tx.addSafeData(opReturnHex);
  tx.sign(privateKey);

  if (DEBUG) {
    console.log(JSON.stringify(tx.toObject(), null, 4), tx.toString());
    return;
  }

  const url = "https://api.whatsonchain.com/v1/bsv/main/tx/raw";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      txhex: tx.toString(),
    })
  });

  if (response.status === 200) {
    console.log("Posted transaction to the blockchain:", tx.id)
  } else {
    console.error("Error posting to the chain:", response.status, response.statusText);
  }
};
