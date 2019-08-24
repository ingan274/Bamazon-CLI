var mysql = require("mysql");

var connection = mysql.createConnection({ 
  host: "localhost", 
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon"
});

// conncting to your sql, it executes when the connection has occured
connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  connection.end();
});
