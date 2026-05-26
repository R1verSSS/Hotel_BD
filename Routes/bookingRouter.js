const express = require("express");
const router = express.Router();
const ctrl = require("../Controllers/bookingController.js");

router.post("/add", ctrl.addToCart);
router.get("/getCart", ctrl.getCart);
router.get("/remove/:index", ctrl.removeFromCart);
router.get("/checkout", ctrl.getCheckout);
router.post("/processCheckIn", ctrl.processCheckIn);
router.get("/getHistory/:GuestId", ctrl.getHistory);

module.exports = router;
