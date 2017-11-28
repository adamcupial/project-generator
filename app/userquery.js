const inquirer = require('inquirer');

const questions = [
  {
    type: 'input',
    name: 'project_name',
    default: 'Test Generator',
    message: "Name of the project"
  },
];

function userQuery () {
  return new Promise((resolve, reject) => {
    inquirer
      .prompt(questions)
      .then((answers) => {
        resolve(answers);
      })
      .catch((err) => {
        console.error(err);
      });
  });
}

module.exports = userQuery;
