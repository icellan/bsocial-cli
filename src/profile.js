import { BAP } from "bitcoin-bap";

import { broadcastTransaction, getBalance } from "./bitcoin.js";
import { BAP_PROTOCOL_ADDRESS } from "bsocial/dist/constants.js";
import { askAreYouSure, askProfileInfo } from "./inquirer.js";

export const resendIdTx = async function (profile) {
    const bap = new BAP(profile.xpriv);
    bap.importIds(profile.ids);
    const ids = bap.listIds();

    const identity = bap.getId(ids[0]); // only support for 1 id per profile now
    const ops = identity.getIdTransaction();

    const broadcastResult = await broadcastTransaction(profile, ops);
    if (!broadcastResult) {
        return
    }

    return true;
};

export const editProfile = async function (profile) {
    const bap = new BAP(profile.xpriv);
    bap.importIds(profile.ids);
    const ids = bap.listIds();
    const identity = bap.getId(ids[0]); // only support for 1 id per profile now

    const identityInfo = {}
    const identityAttributes = identity.getAttributes();
    Object.keys(identityAttributes).forEach(key => {
        const attr = identityAttributes[key];
        identityInfo[key] = attr.value;
    });

    const info = await askProfileInfo(identityInfo);
    const aliasSignedOps = getSignedAliasOps(info, identity);

    const aliasBroadcastResult = await broadcastTransaction(profile, aliasSignedOps);
    if (!aliasBroadcastResult) {
        return
    }

    return true;
};

export const deleteProfile = async function (profileId, profile, conf) {
    const result = await askAreYouSure("Are you sure you want to delete this profile?");
    if (result.sure === 'yes') {
        const balance = await getBalance(profile);
        if (balance > 0) {
            console.error("Address of this identity still has a positive balance of", balance, "satoshis.");
            console.log("Please transfer this balance before deleting the profile.");
            return false;
        } else {
            conf.delete(profileId);
            return true;
        }
    }
}

export const getSignedAliasOps = function(info, identity) {
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

    return identity.signOpReturnWithAIP(aliasOps);
};
