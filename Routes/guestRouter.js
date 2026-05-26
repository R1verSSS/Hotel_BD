const express = require("express");
const router = express.Router();
const ctrl = require("../Controllers/guestController.js");

router.use("/add", ctrl.addGuest);
router.use("/postAdd", ctrl.postAddGuest);
router.use("/edit/:GuestId", ctrl.editGuest);
router.use("/postEdit", ctrl.postEditGuest);
router.use("/", ctrl.getGuests);

module.exports = router;