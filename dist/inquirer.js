import inquirer from"inquirer";import inquirerFileTreeSelection from"inquirer-file-tree-selection-prompt";inquirer.registerPrompt("file-tree-selection",inquirerFileTreeSelection);import os from"os";import path from"path";import chalk from"chalk";export const askAction=function(){return inquirer.prompt([{name:"action",type:"list",choices:["post","load sats","exit"],message:"Select action to perform:",validate:function(a){return!!a.length||"Please select an action"}}])};export const askMessage=function(){return inquirer.prompt([{name:"message",type:"input",message:"Post markdown text:",validate:function(a){return!!a.length||"Please write a message"}}])};export const askProfileName=function(a){return inquirer.prompt([{name:"name",type:"input",default:`ID ${a+1}`,message:"Profile name:",validate:function(a){return!!a.length||"Please input a name for this new profile"}}])};export const askProfile=function(a){const b=Object.keys(a.all),c=[{name:"profile",type:"list",choices:[...b,"+ import","+ new"],message:"Select profile:",validate:function(a){return!!a.length||"Please select a profile"}}];return inquirer.prompt(c)};export const askProfileImport=function(){const a=[{name:"file",type:"file-tree-selection",root:os.homedir(),message:"Select file to import:",validate:a=>{const b=a.split(path.sep).pop();return"."!==b[0]},onlyShowValid:!0,transformer(a){const b=a?a.split(path.sep).pop():"";return"."===b[0]?chalk.grey(b):b}}];return inquirer.prompt(a)};export const askProfileInfo=function(){return inquirer.prompt([{name:"name",type:"input",message:"Enter your name:",validate:function(a){return!!a.length||"Please enter name"}},{name:"bio",type:"input",message:"Enter your bio / tagline:",validate:function(){return!0}},{name:"location",type:"input",message:"Enter your location:",validate:function(){return!0}},{name:"website",type:"input",message:"Enter your website:",validate:function(){return!0}},{name:"paymail",type:"input",message:"Enter your paymail address:",validate:function(){return!0}},{name:"bitcoin",type:"input",message:"Enter your bitcoin address:",validate:function(){return!0}}])};