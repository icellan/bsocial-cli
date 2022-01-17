import qrcode from "qrcode-terminal";

import {broadcastTransaction, getKeys} from "./bitcoin.js";
import {askAddress} from "./inquirer.js";

export const loadSats = function(profile) {
    const {address} = getKeys(profile);
    qrcode.generate("bitcoin:" + address, function (code) {
        console.log(code);
    });
    console.log(`\nAddress: ${address}\n`);
}

export const transferSats = async function(profile) {
    const to = await askAddress();
    return broadcastTransaction(profile, false, to.address);
}
