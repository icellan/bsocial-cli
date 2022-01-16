import bsv from 'bsv';
import fetch from 'node-fetch';

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
