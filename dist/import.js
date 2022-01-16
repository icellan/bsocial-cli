import fs from"fs";import{BAP}from"bitcoin-bap";import{askProfileImport,askProfileName}from"./inquirer.js";export const importProfile=async function(a){const b=Object.keys(a.all),c=await askProfileImport(a),d=fs.readFileSync(c.file,"utf8");let e;try{e=JSON.parse(d)}catch(a){console.error(a),process.exit(-1)}e&&e.xprv&&e.ids||(console.error("Not a valid id import"),process.exit(-1));const f=new BAP(e.xprv);f.importIds(e.ids);const g=await askProfileName(b.length);return g.name=g.name.replace(/[^a-z0-9_-]/ig,"_"),a.set(g.name,{xpriv:e.xprv,ids:e.ids}),g.name};