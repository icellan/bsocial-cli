import inquirer from 'inquirer';
import inquirerFileTreeSelection from 'inquirer-file-tree-selection-prompt';
inquirer.registerPrompt('file-tree-selection', inquirerFileTreeSelection);
import os from 'os';
import path from 'path';
import chalk from 'chalk'

export const askAction = function(conf) {
  const questions = [
    {
      name: 'action',
      type: 'list',
      choices: [
        'post',
        'load sats',
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

export const askProfileInfo = function() {
  const questions = [
    {
      name: 'name',
      type: 'input',
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
      message: 'Enter your bio / tagline:',
      validate: function( ) {
        return true;
      }
    },
    {
      name: 'logo',
      type: 'input',
      message: 'Avatar image url:',
      validate: function( ) {
        return true;
      }
    },
    {
      name: 'banner',
      type: 'input',
      message: 'Banner image url:',
      validate: function( ) {
        return true;
      }
    },
    {
      name: 'location',
      type: 'input',
      message: 'Enter your location:',
      validate: function( ) {
        return true;
      }
    },
    {
      name: 'url',
      type: 'input',
      message: 'Enter your website url:',
      validate: function( ) {
        return true;
      }
    },
    {
      name: 'paymail',
      type: 'input',
      message: 'Enter your paymail address:',
      validate: function( ) {
        return true;
      }
    },
    {
      name: 'bitcoin',
      type: 'input',
      message: 'Enter your bitcoin address:',
      validate: function( ) {
        return true;
      }
    },
  ];
  return inquirer.prompt(questions);
};
