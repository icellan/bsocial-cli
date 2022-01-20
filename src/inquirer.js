import inquirer from 'inquirer';
import inquirerFileTreeSelection from 'inquirer-file-tree-selection-prompt';
inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection);
import os from 'os';
import path from 'path';
import chalk from 'chalk'

export const askAreYouSure = function(message) {
  const questions = [
    {
      name: 'sure',
      type: 'list',
      choices: [
        'no',
        'yes',
      ],
      message: message || 'Are you sure you want to delete this item?',
      validate: function( value ) {
        if (value.length) {
          return true;
        } else {
          return 'Please select an action';
        }
      }
    },
  ];
  return inquirer.prompt(questions);
};

export const askWaitFunding = function() {
  const questions = [
    {
      name: 'selected',
      type: 'list',
      choices: [
        'try again',
        'cancel',
      ],
      message: 'Try again when you have funded the address:',
      validate: function( value ) {
        if (value.length) {
          return true;
        } else {
          return 'Please select an action';
        }
      }
    },
  ];
  return inquirer.prompt(questions);
};

export const askAction = function(conf) {
  const questions = [
    {
      name: 'action',
      type: 'list',
      choices: [
        'post',
        'reply',
        'edit profile',
        'resend id tx',
        'delete profile',
        'transfer sats',
        'load sats',
        'back',
        'exit',
      ],
      message: 'Select action to perform:',
      validate: function( value ) {
        if (value.length) {
          return true;
        } else {
          return 'Please select an action';
        }
      }
    },
  ];
  return inquirer.prompt(questions);
};

export const askMessage = function() {
  const questions = [
    {
      name: 'message',
      type: 'input',
      message: 'Post markdown text:',
      validate: function( value ) {
        if (value.length) {
          return true;
        } else {
          return 'Please write a message';
        }
      }
    },
  ];
  return inquirer.prompt(questions);
};

export const askTxId = function() {
  const questions = [
    {
      name: 'txid',
      type: 'input',
      message: 'Transaction ID of original post:',
      validate: function( value ) {
        if (value.length === 64) {
          return true;
        } else {
          return 'Please input a valid transaction ID';
        }
      }
    },
  ];
  return inquirer.prompt(questions);
};

export const askAddress = function() {
  const questions = [
    {
      name: 'address',
      type: 'input',
      message: 'Bitcoin address to send funds to:',
      validate: function( value ) {
        if (value.length) {
          return true;
        } else {
          return 'Please fill in a Bitcoin address';
        }
      }
    },
  ];
  return inquirer.prompt(questions);
};

export const askProfileName = function(nrOfProfiles) {
  const questions = [
    {
      name: 'name',
      type: 'input',
      default: `ID ${nrOfProfiles + 1}`,
      message: 'Profile name:',
      validate: function( value ) {
        if (value.length) {
          return true;
        } else {
          return 'Please input a name for this new profile';
        }
      }
    },
  ];
  return inquirer.prompt(questions);
};

export const askProfile = function(conf) {
  const profiles = Object.keys(conf.all);
  const questions = [
    {
      name: 'profile',
      type: 'list',
      choices: [...profiles,
        '+ import',
        '+ new'
      ],
      message: 'Select profile:',
      validate: function( value ) {
        if (value.length) {
          return true;
        } else {
          return 'Please select a profile';
        }
      }
    },
  ];
  return inquirer.prompt(questions);
};

export const askProfileImport = function(conf) {
  const questions = [
    {
      name: 'file',
      type: 'file-tree-selection',
      root: os.homedir(),
      message: 'Select file to import:',
      validate: (input) => {
        const name = input.split(path.sep).pop();
        return name[0] !== '.';
      },
      onlyShowValid: true,
      transformer(input) {
        const name = input ? input.split(path.sep).pop() : '';
        if (name[0] === ".") {
          return chalk.grey(name);
        }
        return name;
      }
    },
  ];
  return inquirer.prompt(questions);
};

export const askProfileInfo = function(info = {}) {
  const questions = [
    {
      name: 'name',
      type: 'input',
      default: info.name || '',
      message: 'Enter your name:',
      validate: function( value ) {
        if (value.length) {
          return true;
        } else {
          return 'Please enter name';
        }
      }
    },
    {
      name: 'description',
      type: 'input',
      default: info.description || info.bio || '',
      message: 'Enter your bio / tagline:',
      validate: function( ) {
        return true;
      }
    },
    {
      name: 'logo',
      type: 'input',
      default: info.logo || '',
      message: 'Avatar image url:',
      validate: function( ) {
        return true;
      }
    },
    {
      name: 'banner',
      type: 'input',
      default: info.banner || '',
      message: 'Banner image url:',
      validate: function( ) {
        return true;
      }
    },
    {
      name: 'location',
      type: 'input',
      default: info.location || '',
      message: 'Enter your location:',
      validate: function( ) {
        return true;
      }
    },
    {
      name: 'url',
      type: 'input',
      default: info.url || '',
      message: 'Enter your website url:',
      validate: function( ) {
        return true;
      }
    },
    {
      name: 'paymail',
      type: 'input',
      default: info.paymail || '',
      message: 'Enter your paymail address:',
      validate: function( ) {
        return true;
      }
    },
    {
      name: 'bitcoinAddress',
      type: 'input',
      default: info.bitcoinAddress || '',
      message: 'Enter your bitcoin address:',
      validate: function( ) {
        return true;
      }
    },
  ];
  return inquirer.prompt(questions);
};
