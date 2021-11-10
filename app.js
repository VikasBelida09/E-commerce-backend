//imports
require("dotenv/config");
const express = require("express");
const morgan = require("morgan"); // for logging
const mongoose = require("mongoose");
const cors = require("cors");
const authJWT = require("./Middlewares/jwt");
const errorHandler = require("./Middlewares/errorHandler");
//routers
const ProductRouter = require("./routes/products");
const CategoryRouter = require("./routes/category");
const userRouter = require("./routes/user");
const app = express();
const apiPrefix = process.env.API_PREFIX;
//middlewares
app.use(cors());
app.options("*", cors());
app.use(authJWT());
app.use(errorHandler);
app.use(express.json());
app.use(morgan("combined"));
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use(`${apiPrefix}/product`, ProductRouter);
app.use(`${apiPrefix}/category`, CategoryRouter);
app.use(`${apiPrefix}/users`, userRouter);

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
