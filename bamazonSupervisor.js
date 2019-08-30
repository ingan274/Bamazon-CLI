var mysql = require("mysql2");
var inquirer = require('inquirer');
var MaxLengthInputPrompt = require('inquirer-maxlength-input-prompt');
inquirer.registerPrompt('maxlength-input', MaxLengthInputPrompt);
var Table = require('cli-table');
var chalk = require('chalk');

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon"
});

function runSupervisorView() {
  console.log(chalk.whiteBright.bold("\nWelcome to Bamazon"))
  function initiateSupervisor() {
    inquirer.prompt({
      type: "list",
      name: "supervisorAction",
      message: "Please select an Action",
      choices: ['View Product Sales by Department', 'Create New Department', 'Exit']
    })
      .then((answers) => {
        switch (answers.supervisorAction) {
          case 'View Product Sales by Department':
            productSalesByDept();
            break;
          case 'Create New Department':
            newDepartment();
            break;
          case 'Exit':
            console.log("\nSee you next time! Have a Bamazon Day!\n");
            process.exit(0);
            break;
        };
      });
  };
  initiateSupervisor();

  function productSalesByDept() {
    connection.query("SELECT d.department_id, d.department_name, d.over_head_costs, SUM(p.product_sales) AS product_sales, (SUM(p.product_sales) - d.over_head_costs) AS total_profit FROM departments d LEFT JOIN products p ON d.department_name = p.department_name GROUP BY d.department_id, d.department_name, d.over_head_costs;", function (error, response) {
      if (error) throw error;
      console.log(chalk.bgMagenta.bold.whiteBright("\n  Product Sales and Total Profit's Per Department \n"));
      var tableSales = new Table({ head: [chalk.blueBright.bold("Department ID"), chalk.magentaBright.bold("Department Name"), chalk.magentaBright.bold("Overhead Costs ($)"), chalk.magentaBright.bold("Product Sales ($)"), chalk.magentaBright.bold("Total Profit ($)")] });
      // console.log(response);
      for (var line of response) {
        var dept_id = line.department_id;
        var dept_name = line.department_name;
        var overhead = line.over_head_costs;
        var product_sales = parseFloat(line.product_sales);
        var total_profit = parseFloat(line.total_profit);
        var object = [dept_id, dept_name, overhead, product_sales, total_profit]
        tableSales.push(object)
      }

      console.log(chalk.whiteBright(tableSales.toString()) + "\n");
      initiateSupervisor();
    });
  };

  function newDepartment() {
    inquirer.prompt([
      {
        name: "departmentName",
        type: "maxlength-input",
        message: "Department Name:",
        validate: function (userInput) {
          if (userInput.trim()) {
            return true;
          }

          return "This field cannot be empty.";
        },
        maxLength: 50
      },
      {
        name: "overheadCosts",
        type: "input",
        message: "Overhead Costs:",
        validate: function (userInput) {
          if (isNaN(userInput)) {
            return "Please enter a valid number."
          }

          return true;
        }
      }
    ]).then((userInput) => {
      var addingDept = new Table({ head: [chalk.magentaBright("Department Name"), chalk.magentaBright("Overhead Cost ($)")] });
      var object = [userInput.departmentName, userInput.overheadCosts];
      addingDept.push(object);

      inquirer.prompt({
        type: "confirm",
        name: "updateReview",
        message: "Please Review Update and Confirm Details: \n" + chalk.whiteBright(addingDept.toString() + "\n")
      })
        .then((answers) => {
          if (answers.checkoutReview) {
            createDepartment(userInput.departmentName, userInput.overheadCosts);
            console.log("\nSubmission Successful! Your order is being processed.\n")
          } else if (!answers.checkoutReview) {
            console.log("Your addition has been cancelled.")
            initiateSupervisor();
          };
        });
    })
  };

  function createDepartment(departmentName, overheadCosts) {
    connection.query("INSERT INTO departments SET ?",
      {
        department_name: departmentName,
        over_head_costs: overheadCosts
      },
      function (error, response) {
        if (error) throw error;
        connection.query(
          'SELECT * FROM products',
          function (err, results) {
            // console.table(results); 
            console.log(chalk.bgMagenta.bold.whiteBright("\n  Updated List of Departments \n"));
            var table = new Table({ head: [chalk.blueBright("Item ID"), chalk.magentaBright("Deparment Name"), chalk.magentaBright("Overhead")] });
            numberOfItem = results.length;
            for (var line of results) {
              var deptID = line.department_id;
              var deptName = line.department_id_name;
              var deptCosts = line.over_head_costs;

              var object = [deptID, deptName, deptCosts]

              table.push(object)
            };
            console.log("\n" + chalk.whiteBright(table.toString()) + "\n");
          });
        console.log("\nDepartment has been created.\n");
      })
  }
}
module.exports = runSupervisorView;