import bsv from"bsv";import fetch from"node-fetch";import{DEBUG}from"./index.js";export const getKeys=function(a){const b=bsv.HDPrivateKey.fromString(a.xpriv),c=b.deriveChild("m/44'/0'/0'"),d=c.privateKey,e=c.publicKey,f=e.toAddress().toString();return{privateKey:d,publicKey:e,address:f}};export const getBalance=async function(a){const{address:b}=getKeys(a),c=await fetch("https://api.whatsonchain.com/v1/bsv/main/address/<address>/balance".replace("<address>",b)),d=await c.json();return d?.confirmed+d?.unconfirmed};export const getUtxos=async function(a){const{address:b}=getKeys(a),c=await fetch("https://api.whatsonchain.com/v1/bsv/main/address/<address>/unspent".replace("<address>",b));return c.json()};export const getTx=async function(a){const b=await fetch("https://api.whatsonchain.com/v1/bsv/main/tx/<hash>/hex".replace("<hash>",a));return b.text()};export const broadcastTransaction=async function(a,b,c=null){const{privateKey:d,address:e}=getKeys(a),f=await getUtxos(a),g=[];for(let d=0;d<f.length;d++){const a=f[d],b=await getTx(a.tx_hash),c=new bsv.Transaction;c.fromString(b);const e=c.outputs[a.tx_pos].toObject();g.push({txid:a.tx_hash,vout:+a.tx_pos,satoshis:+e.satoshis,scriptPubKey:e.script})}const h=new bsv.Transaction;if(h.from(g),c)h.change(c);else{h.change(e);const a=b.map(a=>Buffer.from(a,"hex"));h.addSafeData(a)}if(h.sign(d),DEBUG)return void console.log(JSON.stringify(h.toObject(),null,4),h.toString());const i=await fetch("https://api.whatsonchain.com/v1/bsv/main/tx/raw",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({txhex:h.toString()})});return 200===i.status?(console.log("Posted transaction to the blockchain:",h.id),!0):(console.error("Error posting to the chain:",i.status,i.statusText),!1)};