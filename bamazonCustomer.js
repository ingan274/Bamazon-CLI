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

var numberOfItem;
function runCustomerView() {
  connection.query(
    'SELECT * FROM products',
    function (err, results) {
      // console.table(results); 
      var table = new Table({ head: [chalk.blueBright("Item ID"), chalk.magentaBright("Product Name"), chalk.magentaBright("Price")] });
      console.log(chalk.whiteBright.bold("\nWelcome to Bamazon"))
      console.log(chalk.bgMagenta.bold.whiteBright("\n  Shop Away!!  \n"));
      numberOfItem = results.length;
      for (var line of results) {
        var itemID = line.item_id;
        var itemName = line.product_name;
        var itemPrice = line.price;

        var object = [itemID, itemName, itemPrice]

        table.push(object)
      };
      console.log("\n" + chalk.whiteBright(table.toString()) + "\n");

      initiateCustomer();
    });

  function initiateCustomer() {
    inquirer.prompt({
      type: "confirm",
      name: "confirmBuy",
      message: "Would you like to purchase an item?"
    })
      .then((answers) => {
        if (!answers.confirmBuy) {
          connection.end();
          console.log("\nSee you next time! Have a Bamazon Day!\n");
          process.exit(0);
          return;
        } else {
          buying()
        }
      });
  };

  function buying() {
    inquirer.prompt([{
      type: "input",
      name: "itemNumber",
      message: "What is the Item you would like to purchase? (Please input Item ID)",
      validate: (input) => {
        if (isNaN(input) === false && parseInt(input) <= numberOfItem) {
          return true;
        }
        console.log("\n Please input a proper Item ID number. Thank you.");
        return false;
      }
    },
    {
      type: "input",
      name: "itemAmount",
      message: "How many would you like to buy",
      validate: (input) => {
        if (isNaN(input) === false) {
          return true;
        }
        console.log("Please input a number. Thank you");
        return false;
      }
    }])
      .then((answers) => {
        var productID = answers.itemNumber;
        var amount = parseInt(answers.itemAmount);
        var newInventory;
        var newQuantPruchased;

        connection.query(
          'SELECT * FROM products WHERE item_id = ' + productID,
          function (err, results) {
            if (err) throw err;

            for (var result of results) {
              // console.log(result);
              var quant = parseInt(result.stock_quantity);
              var purchased = parseInt(result.quantity_purchased);
              var name = result.product_name;
              var costList = parseFloat(result.price);
              var cost = (costList * amount).toFixed(2)
              newInventory = quant - amount;
              newQuantPruchased = amount + purchased;

              var checkout = new Table({ head: [chalk.magentaBright("Product Name"), chalk.magentaBright("Price"), chalk.magentaBright("Amount"), chalk.blueBright("Total")] });
              var object = [name, costList, amount, cost]
              checkout.push(object);

              if (quant < amount) {
                console.log("\nSorry. Looks like there it not enough inventory to purchase " + amount + "\n")
                initiateCustomer();
              } else if (quant > amount) {
                inquirer.prompt({
                  type: "confirm",
                  name: "checkoutReview",
                  message: "Please Review Order and Confirm Details: \n" + chalk.whiteBright(checkout.toString() + "\n")
                })
                  .then((answers) => {
                    if (answers.checkoutReview) {
                      updateInventory(newInventory, productID);
                      updateQuantPurchased(newQuantPruchased, productID);
                      updateProductSales();
                      console.log("\nSubmission Successful! Your order is being processed.\n")
                    } else if (!answers.checkoutReview) {
                      console.log("Your Cart is now empty.")
                      initiateCustomer();
                    };
                  });
              }
            };
          });
      });

    function updateInventory(newInventory, productID) {
      connection.query(
        'UPDATE products SET ? WHERE item_id = ' + productID,
        { stock_quantity: newInventory },
        function (err, results) {
          if (err) throw err;
        });
    }

    function updateQuantPurchased(newQuantPruchased, productID) {
      connection.query(
        'UPDATE products SET ? WHERE item_id = ' + productID,
        { quantity_purchased: newQuantPruchased },
        function (err, results) {
          if (err) throw err;
        });
    }
    function updateProductSales() {
      connection.query(
        'UPDATE products SET product_sales = quantity_purchased * price',
        function (err, results) {
          if (err) throw err;
          initiateCustomer();
        });
    }
  }
}
  module.exports = runCustomerView;