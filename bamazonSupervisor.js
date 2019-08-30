var mysql = require("mysql2");
var inquirer = require('inquirer');
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

  };
}
module.exports = runSupervisorView;