//imports
require("dotenv/config");
const express = require("express");
const morgan = require("morgan"); // for logging
const mongoose = require("mongoose");
//routers
const ProductRouter = require("./routers/products");
const CategoryRouter = require("./routers/category");
const app = express();
//middlewares
app.use(express.json());
app.use(morgan("combined"));
const apiPrefix = process.env.API_PREFIX;
app.use(`${apiPrefix}/product`, ProductRouter);
app.use(`${apiPrefix}/category`, CategoryRouter);

//connect to mongodb
const uri = process.env.MONGO_URI;
//db connection
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("done!"));
//server listening on port 3000
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
