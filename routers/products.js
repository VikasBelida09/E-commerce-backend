const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Product = require("../models/product");
const Category = require("../models/category");
router.post(`/`, async (req, res) => {
  //validate category before creating a new product
  const categoryP = await Category.findById(req.body.category);
  if (!categoryP) return res.status(400).send("Invalid category");
  const {
    name,
    price,
    image,
    countInStock,
    description,
    richDescription,
    rating,
    numReviews,
    isFeatured,
    category,
    brand,
  } = req.body;
  let product = new Product({
    name,
    price,
    image,
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
router.put(`/:id`, async (req, res) => {
  //validate category before creating a new product
  const categoryP = await Category.findById(req.body.category);
  if (!categoryP) return res.status(400).send("Invalid category");
  const {
    name,
    price,
    image,
    countInStock,
    description,
    richDescription,
    rating,
    numReviews,
    isFeatured,
    category,
    brand,
  } = req.body;
  let product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name,
      price,
      image,
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
  if (!product) return res.status(500).json({ error: false, success: false });
  return res.send(product);
});
router.get(`/`, async (req, res) => {
  const productList = await Product.find().populate("category");
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
module.exports = router;
