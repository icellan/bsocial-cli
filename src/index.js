#!/usr/bin/env node

import fs from 'fs';
import Yargs from 'yargs';
import { hideBin } from 'yargs/helpers'
import Configstore from 'configstore';

import { newProfile } from './new.js';
import {askAction, askProfile, askTxId} from './inquirer.js';
import { post } from './post.js'
import { importProfile } from './import.js';
import { getBalance } from './bitcoin.js';
import { loadSats, transferSats } from "./sats.js";
import { deleteProfile, editProfile, resendIdTx } from "./profile.js";

export const DEBUG = false;
export const APP_NAME = 'bsocial.cli';

const conf = new Configstore('bsocial-cli');
const options = Yargs(hideBin(process.argv)).usage('Usage: -p <profile file>').
  option('p', {
    alias: 'profile',
    describe: 'Profile to use',
    type: 'string',
  }).
  option('l', {
    alias: 'location',
    describe: 'Show the location of the config file',
    type: 'string',
  }).
  option('m', {
    alias: 'message',
    describe: 'Message to send on-chain',
    type: 'string',
  }).
  option('t', {
    alias: 'txId',
    describe: 'Reply to transaction ID',
    type: 'string',
  })
  .argv;

if (options.location) {
  console.log('Config stored at:', conf.path);
  process.exit(0);
}

let fsMessage;
try {
  fsMessage = fs.readFileSync(process.stdin.fd).toString()
} catch (e) {}

const run = async () => {
  let useProfile = options.profile;
  while(1) {
    while (!useProfile) {
      const result = await askProfile(conf);
      if (result.profile === '+ import') {
        useProfile = await importProfile(conf);
      } else if (result.profile === '+ new') {
        useProfile = await newProfile(conf);
      } else {
        useProfile = result.profile;
      }
    }

    if (!useProfile) {
      console.error('No profile selected');
      process.exit(-1);
    }

    const profile = conf.get(useProfile);
    if (!profile || !profile.xpriv || !profile.ids) {
      console.error('Profile is not valid');
      process.exit(-1);
    }

    const balance = await getBalance(profile);
    if (balance <= 0) {
      console.log("Address does not have any satoshis. Please fund this address to post from this program.\n");
      loadSats(profile);
      process.exit(-1);
    } else {
      console.log("Current wallet balance:", balance);
    }

    if (fsMessage) {
      await post(profile, fsMessage.trim(), options.txId);
      // exit the process if we are piping content into a post
      process.exit(0);
    } else if (options.message) {
      await post(profile, options.message, options.txId);
      // exit the process if we are passing a message via command line arguments
      process.exit(0);
    } else {
      while (1) {
        const result = await askAction(conf);
        if (result.action === 'post') {
          await post(profile, "");
        } else if (result.action === 'reply') {
          const r = await askTxId();
          await post(profile, "", r.txid);
        } else if (result.action === 'transfer sats') {
          await transferSats(profile);
        } else if (result.action === 'load sats') {
          loadSats(profile);
        } else if (result.action === 'edit profile') {
          await editProfile(profile);
        } else if (result.action === 'resend id tx') {
          await resendIdTx(profile);
        } else if (result.action === 'delete profile') {
          const result = await deleteProfile(useProfile, profile, conf);
          if (result) {
            useProfile = null;
            break;
          }
        } else if (result.action === 'back') {
          useProfile = null;
          break;
        } else if (result.action === 'exit') {
          process.exit(0);
        }
      }
    }
  }
};

run();
