import bsv from 'bsv';
import fetch from 'node-fetch';

import { DEBUG } from "./index.js";

export const getKeys = function (profile) {
  const hdKey = bsv.HDPrivateKey.fromString(profile.xpriv);

  const key = hdKey.deriveChild('m/44\'/0\'/0\'');
  const privateKey = key.privateKey;
  const publicKey = key.publicKey;
  const address = publicKey.toAddress().toString();

  return { privateKey, publicKey, address };
};

export const getBalance = async function(profile) {
  const { address } = getKeys(profile);

  const url = "https://api.whatsonchain.com/v1/bsv/main/address/<address>/balance"
  const response = await fetch(url.replace('<address>', address));
  const body = await response.json();

  return body?.confirmed + body?.unconfirmed;
}

export const getUtxos = async function(profile) {
  const { address } = getKeys(profile);

  const url = "https://api.whatsonchain.com/v1/bsv/main/address/<address>/unspent"
  const response = await fetch(url.replace('<address>', address));
  return response.json();
}

export const getTx = async function(txId) {
  const url = "https://api.whatsonchain.com/v1/bsv/main/tx/<hash>/hex"
  const response = await fetch(url.replace('<hash>', txId));
  return response.text();
}

export const broadcastTransaction = async function(profile, signedOps) {
  const {privateKey, address} = getKeys(profile);

  const opReturnHex = signedOps.map(o => Buffer.from(o, 'hex'));

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
    console.log("Posted transaction to the blockchain:", tx.id);
    return true;
  } else {
    console.error("Error posting to the chain:", response.status, response.statusText);
    return false;
  }
}
