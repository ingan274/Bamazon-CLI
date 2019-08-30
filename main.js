var inquirer = require("inquirer");
var chalk = require('chalk');

var runCustomerView = require("./bamazonCustomer");
var runManagerView = require("./bamazonManager");
var runSupervisorView = require("./bamazonSupervisor");

mainMenu();
function mainMenu() {
    console.log(chalk.blueBright.bold("\n  Welcome to Bamazon!  \n"));
    inquirer.prompt([
        {
            name: "userType",
            type: "list",
            message: "Please select your user type.",
            choices: ["Customer", "Manager", "Supervisor", "Quit"]
        }
    ]).then(function (userInput) {
        var userType = userInput.userType;
        switch (userType) {
            case 'Customer':
                runCustomerView();
                break;
            case 'Manager':
                runManagerView();
                break;
            case 'Supervisor':
                runSupervisorView();
                break;
            case 'Quit':
                console.log("\nSee you next time! Have a Bamazon Day!\n");
                process.exit(0);
                break;
        };
    })
}
