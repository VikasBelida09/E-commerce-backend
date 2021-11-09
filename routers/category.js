const express = require("express");
const router = express.Router();
const Category = require("../models/category");

router.get("/", async (req, res) => {
  const categoryList = await Category.find();
  if (!categoryList) return res.status(500).json({ success: false });
  return res.send(categoryList);
});

router.get("/:id", async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category)
    return res.status(500).json({
      success: false,
      message: "Category with given category is not found",
    });
  return res.send(category);
});

router.post("/", async (req, res) => {
  const { name, color, icon } = req.body;
  const category = new Category({ name, color, icon });
  const result = await category.save();
  if (!result) return res.status(404).json({ success: false });
  return res.send(result);
});

router.delete("/:id", async (req, res) => {
  Category.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (category)
        return res
          .status(200)
          .json({ success: true, message: "Category deleted" });
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    })
    .catch((err) => {
      return res.status(400).json({ success: false, message: "Server error" });
    });
});

router.put("/:id", async function (req, res) {
  const { name, color, icon } = req.body;
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name,
      color,
      icon,
    },
    { new: true }
  );
  if (!category)
    return res
      .status(404)
      .json({ success: false, message: "Category not found" });
  return res.send(category);
});
module.exports = router;
