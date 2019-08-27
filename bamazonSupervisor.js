var mysql = require("mysql2");
var inquirer = require('inquirer');

var connection = mysql.createConnection({ 
  host: "localhost", 
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon"
});
