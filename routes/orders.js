const express = require("express");
const router = express.Router();
const Orders = require("../models/Orders");
const OrderItem = require("../models/OrderItem");
router.get("/", async (req, res) => {
  //returns orders sorted by date
  const orderList = await Orders.find()
    .populate("user", "name")
    .sort({ dateOrdered: -1 });
  if (!orderList) return res.status(500).json({ success: false });
  return res.send(orderList);
});

router.get("/:id", async (req, res) => {
  const Orders = await Orders.findById(req.params.id)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    });
  if (!Orders)
    return res.status(500).json({
      success: false,
      message: "Orders with given Order id is not found",
    });
  return res.send(Orders);
});
router.post("/", async (req, res) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });
      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    })
  );
  const resolvedOrderIds = await orderItemsIds;
  const totalPrice = await Promise.all(
    resolvedOrderIds.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        "product",
        "price"
      );
      const price = orderItem.product.price * orderItem.quantity;
      return price;
    })
  );
  const totalPriceSum = totalPrice.reduce((a, b) => a + b, 0);
  const {
    shippingAddress1,
    shippingAddress2,
    city,
    zip,
    country,
    phone,
    status,
    user,
  } = req.body;
  const order = new Orders({
    orderItems: resolvedOrderIds,
    shippingAddress1,
    shippingAddress2,
    city,
    zip,
    country,
    phone,
    status,
    totalPrice: totalPriceSum,
    user,
  });
  const result = await order.save();
  if (!result) return res.status(400).json({ success: false });
  return res.send(result);
});

router.put("/:id", async (req, res) => {
  const order = await Orders.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (!order)
    return res.status(404).json({ success: false, message: "Order not found" });
  return res.send(order);
});

router.delete("/:id", async (req, res) => {
  Orders.findByIdAndDelete(req.params.id).then(async (orders) => {
    if (!orders)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    await OrderItem.deleteMany({ _id: { $in: orders.orderItems } });
    return res
      .status(200)
      .send({ message: "Order deleted successfully", success: true });
  });
});

router.get("/get/totalsales", async function (req, res) {
  const totalSales = await Orders.aggregate([
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$totalPrice" },
      },
    },
  ]);
  if (!totalSales)
    return res
      .status(400)
      .json({ success: false, message: "Order sales cant be generated" });
  return res.send({ totalSales: totalSales.pop().totalSales });
});
router.get("/get/count", async (req, res) => {
  const orderCount = await Orders.countDocuments();
  if (!orderCount) return res.status(400).send("No Products");
  return res.send({ count: orderCount });
});
module.exports = router;
