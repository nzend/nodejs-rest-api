const mongoose = require("mongoose");
require("dotenv").config();
const { DB_HOST } = process.env;

console.log(DB_HOST);

mongoose.set("strictQuery", true);
mongoose
  .connect(DB_HOST)
  .then(() => {
    console.log("Database connection successful");
    app.listen(3000, () => {
      console.log("Server running. Use our API on port: 3000");
    });
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });

const app = require("./app");
