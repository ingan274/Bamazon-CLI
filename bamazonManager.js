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

function runManagerView() {
  console.log(chalk.whiteBright.bold("\nWelcome to Bamazon"))
  function initiateManager() {
    inquirer.prompt({
      type: "list",
      name: "managerAction",
      message: "Please select an Action",
      choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Exit']
    })
      .then((answers) => {
        switch (answers.managerAction) {
          case 'View Products for Sale':
            productSales();
            break;
          case 'View Low Inventory':
            lowInventory();
            break;
          case 'Add to Inventory':
            addInventory();
            break;
          case 'Add New Product':
            addProduct();
            break;
          case 'Exit':
            console.log("\nSee you next time! Have a Bamazon Day!\n");
            process.exit(0);
            break;
        };
      });
  };
  initiateManager();

  // list every available item: the item IDs, names, prices, and quantities.
  function productSales() {
    connection.query(
      'SELECT * FROM products',
      function (err, results) {
        // console.table(results); 
        var table = new Table({ head: [chalk.blueBright("Item ID"), chalk.magentaBright("Product Name"), chalk.magentaBright("Price"), chalk.magentaBright("Quantities")] });
        for (var line of results) {
          var itemID = line.item_id;
          var itemName = line.product_name;
          var itemPrice = line.price;
          var itemQuant = line.stock_quantity;

          var object = [itemID, itemName, itemPrice, itemQuant]

          table.push(object)
        };
        console.log("\n" + chalk.whiteBright(table.toString()) + "\n");
        inquirer.prompt({
          type: "confirm",
          name: "newSearch",
          message: "Would you like to do something else?"
        })
          .then((answers) => {
            if (answers.newSearch) {
              console.log("\n")
              initiateManager();
            } else if (!answers.newSearch) {
              console.log("\nSee you next time! Have a Bamazon Day!\n");
              process.exit(0);
            };
          });
      });
  };

  //list all items with an inventory count lower than five.
  function lowInventory() {
    connection.query(
      'SELECT * FROM products WHERE (stock_quantity) BETWEEN 0 AND 5',
      function (err, results) {
        // console.table(results);
        var table = new Table({ head: [chalk.blueBright("Item ID"), chalk.magentaBright("Product Name"), chalk.magentaBright("Price"), chalk.magentaBright("Quantities")] });
        for (var line of results) {
          var itemID = line.item_id;
          var itemName = line.product_name;
          var itemPrice = line.price;
          var itemQuant = line.stock_quantity;

          var object = [itemID, itemName, itemPrice, itemQuant]

          table.push(object)
        };
        console.log("\n" + chalk.whiteBright(table.toString()) + "\n");
        inquirer.prompt({
          type: "confirm",
          name: "moreAction",
          message: "Would you like to do something else?"
        })
          .then((answers) => {
            if (answers.moreAction) {
              console.log("\n")
              initiateManager();
            } else if (!answers.moreAction) {
              console.log("\nSee you next time! Have a Bamazon Day!\n");
              process.exit(0);
            };
          });
      }
    );
  };

  //display a prompt that will let the manager "add more" of any item currently in the store.
  function addInventory() {
    connection.query(
      'SELECT * FROM products',
      function (err, results) {
        // console.table(results); 
        var table = new Table({ head: [chalk.blueBright("Item ID"), chalk.magentaBright("Product Name"), chalk.magentaBright("Price"), chalk.magentaBright("Quantities")] });
        for (var line of results) {
          var itemID = line.item_id;
          var itemName = line.product_name;
          var itemPrice = line.price;
          var itemQuant = line.stock_quantity;

          var object = [itemID, itemName, itemPrice, itemQuant]

          table.push(object)
        };
        console.log("\n" + chalk.whiteBright(table.toString()) + "\n");
        inquirer.prompt([{
          type: "input",
          name: "addInventoryID",
          message: "Would Item would you like to add? (Enter Item ID Number)",
          validate: (input) => {
            if (isNaN(input) === false && parseInt(input) < results.length) {
              return true;
            }
            console.log("\n Please input a proper Item ID number. Thank you");
            return false;
          }
        },
        {
          type: "input",
          name: "inventoryUpdate",
          message: "How many would you like to add",
          validate: (input) => {
            if (isNaN(input) === false) {
              return true;
            }
            console.log("Please input a number. Thank you");
            return false;

          }
        }])
          .then((answers) => {
            var id = answers.addInventoryID;
            var update = parseInt(answers.inventoryUpdate);
            connection.query(
              'SELECT * FROM products WHERE item_id = ' + id,
              function (err, results) {
                // console.table(results); 
                var updateTable = new Table({ head: [chalk.blueBright("Item ID"), chalk.magentaBright("Product Name"), chalk.magentaBright("Price"), chalk.magentaBright("Quantities")] });
                for (var line of results) {
                  var itemID = line.item_id;
                  var itemName = line.product_name;
                  var itemPrice = line.price;
                  var itemQuant = parseInt(line.stock_quantity);
                  var quantUpdate = itemQuant + update;

                  var object = [itemID, itemName, itemPrice, quantUpdate]

                  updateTable.push(object)
                };

                inquirer.prompt({
                  type: "confirm",
                  name: "updateReview",
                  message: "Please Review Order and Confirm Details: \n" + chalk.whiteBright(updateTable.toString() + "\n")
                })
                  .then((answers) => {
                    if (answers.updateReview) {
                      console.log("\nUpdate Successful!.\n")
                      connection.query(
                        'UPDATE products SET ? WHERE item_id = ' + id,
                        { stock_quantity: quantUpdate },
                        function (err, results) {
                          if (err) throw err;
                          initiateManager();
                        });
                    } else if (!answers.checkoutReview) {
                      console.log("Your Update has been cancelled")
                      initiateManager();
                    };
                  });
              });
          });
      })
  };

  //to add a completely new product to the store.
  function addProduct() {
    inquirer.prompt([{
      type: "maxlength-input",
      name: "addProductName",
      message: "Would Item Name you would like to add? (100 characters)",
      maxLength: 100
    },
    {
      type: "maxlength-input",
      name: "addProductDepartment",
      message: "Would Department does this Item call under? (50 characters)",
      maxLength: 50
    },
    {
      type: "input",
      name: "addProductCost",
      message: "What is the market price of the product?",
      validate: (input) => {
        if (isNaN(input) === false) {
          return true;
        }
        console.log("Please input a number. Thank you");
        return false;

      }
    },
    {
      type: "input",
      name: "addProductQuantity",
      message: "How many of this product is being added to the inventory?",
      validate: (input) => {
        if (isNaN(input) === false) {
          return true;
        }
        console.log("\n Please input a proper Item ID number. Thank you");
        return false;
      }
    }])
      .then((answers) => {
        var productName = answers.addProductName;
        var productDept = answers.addProductDepartment;
        var productCost = answers.addProductCost;
        var productQuant = answers.addProductQuantity;
        var addItemTable = new Table({ head: [chalk.magentaBright("Product Name"), chalk.magentaBright("Department"), chalk.magentaBright("Price"), chalk.magentaBright("Quantities")] });
        var object = [productName, productDept, productCost, productQuant]
        addItemTable.push(object);

        inquirer.prompt({
          type: "confirm",
          name: "addReview",
          message: "Please Review Order and Confirm Details: \n" + chalk.whiteBright(addItemTable.toString() + "\n")
        })
          .then((answers) => {
            if (answers.addReview) {
              console.log("\nItem Successfully Added!.\n")
              connection.query(
                'INSERT INTO products SET ? ',
                {
                  product_name: productName,
                  department_name: productDept,
                  price: productCost,
                  stock_quantity: productQuant,
                },
                function (err, results) {
                  if (err) throw err;
                  connection.query(
                    'SELECT * FROM products',
                    function (err, results) {
                      // console.table(results); 
                      var table = new Table({ head: [chalk.blueBright("Item ID"), chalk.magentaBright("Product Name"), chalk.magentaBright("Price"), chalk.magentaBright("Quantities")] });
                      for (var line of results) {
                        var itemID = line.item_id;
                        var itemName = line.product_name;
                        var itemPrice = line.price;
                        var itemQuant = line.stock_quantity;

                        var object = [itemID, itemName, itemPrice, itemQuant]

                        table.push(object)
                      };
                      console.log("\n" + chalk.whiteBright(table.toString()) + "\n");
                      console.log(chalk.inverse("Please see updated Inventory List Above\n\n"));
                      initiateManager();
                    })

                });
            } else if (!answers.checkoutReview) {
              console.log("Your Addition has been cancelled")
              initiateManager();
            };
          });

      });
  };
}

module.exports = runManagerView;