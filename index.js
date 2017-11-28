#!/usr/bin/env node
const slugify = require('slugify');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const chalk = require('chalk');

const userQuery = require('./app/userquery.js');
const generator = require('./app/generator.js');

console.log(chalk.white('Welcome to project generator, answer few simple questions to begin'));

userQuery()
  .then((data) => {
    const slugifiedProjectName = slugify(data.project_name);
    const finalDir = path.join(process.cwd(), slugifiedProjectName);
    fs.mkdir(finalDir, () => {
      generator(finalDir, data)
        .then(() => {
          console.log(chalk.green('Project generated successfully'));
          console.log(chalk.white('Initializing...'));
          exec(`cd ${slugifiedProjectName} && git init && git add . && git commit -am '* INITIAL'`, (err) => {
            if (err) throw err;
            console.log(chalk.green('Generation && Initialization completed successfully'));
          });
        });
    });
  });
