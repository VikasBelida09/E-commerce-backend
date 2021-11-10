const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Product = require("../models/product");
const Category = require("../models/category");
const multer = require("multer");
const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "public/uploads");
  },
  filename: function (req, file, cb) {
    const filename = file.originalname.split(" ").join("-");
    cb(null, `${filename}-${Date.now()}.${FILE_TYPE_MAP[file.mimetype]}`);
  },
});

const uploadOptions = multer({ storage: storage });
router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  //validate request
  const {
    name,
    price,
    countInStock,
    description,
    richDescription,
    rating,
    numReviews,
    isFeatured,
    category,
    brand,
  } = req.body;
  const image = req?.file;
  if (!name || !description || !price || !category || !image)
    return res.status(400).send("required fields are missing");
  //validate category before creating a new product
  const categoryP = await Category.findById(req.body.category);
  if (!categoryP) return res.status(400).send("Invalid category");

  const fileName = req.file.filename;
  const imagePath = `${req.protocol}://${req.get(
    "host"
  )}/public/uploads/${fileName}`;
  let product = new Product({
    name,
    price,
    image: imagePath,
    countInStock,
    description,
    richDescription,
    rating,
    numReviews,
    isFeatured,
    category,
    brand,
  });
  product = await product.save();
  if (!product) return res.status(500).json({ error: false, success: false });
  return res.status(200).json(product);
});
router.put(`/:id`, uploadOptions.single("image"), async (req, res) => {
  //validate category before creating a new product
  const categoryP = await Category.findById(req.body.category);
  if (!categoryP) return res.status(400).send("Invalid category");
  const {
    name,
    price,
    countInStock,
    description,
    richDescription,
    rating,
    numReviews,
    isFeatured,
    category,
    brand,
  } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(400).send("Invalid product");
  let imagePath;
  console.log("i shouldnt be here");
  if (req.file) {
    const fileName = req.file.filename;
    imagePath = `${req.protocol}://${req.get(
      "host"
    )}/public/uploads/${fileName}`;
  } else {
    imagePath = product.image;
  }
  let updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name,
      price,
      image: imagePath,
      countInStock,
      description,
      richDescription,
      rating,
      numReviews,
      isFeatured,
      category,
      brand,
    },
    { new: true }
  );
  if (!updatedProduct)
    return res.status(500).json({ error: false, success: false });
  return res.send(updatedProduct);
});
router.get(`/`, async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  const productList = await Product.find(filter).populate("category");
  res.status(200).json(productList);
});
router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");
  if (!product) return res.status(400).send("Product not found");
  res.status(200).json(product);
});
router.delete(`/:id`, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).send("Invalid id");
  Product.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (category)
        return res
          .status(200)
          .json({ success: true, message: "Product deleted" });
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    })
    .catch((err) => {
      return res.status(400).json({ success: false, message: "Server error" });
    });
});
//gets count of the products
router.get("/get/count", async (req, res) => {
  const productCount = await Product.countDocuments();
  if (!productCount) return res.status(400).send("No Products");
  return res.send({ count: productCount });
});
//gets all the featured products with limit
router.get("/get/featured/:count", async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const productList = await Product.find({ isFeatured: true })
    .limit(+count)
    .populate("category");
  if (!productList) return res.status(400).send("No Products");
  return res.send(productList);
});

router.put(
  "/gallery-images/:id",
  uploadOptions.any("images"),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid Product Id");
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    if (files) {
      files.map((file) => {
        imagesPaths.push(`${basePath}${file.filename}`);
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths,
      },
      { new: true }
    );

    if (!product) return res.status(500).send("the gallery cannot be updated!");

    res.send(product);
  }
);

module.exports = router;
