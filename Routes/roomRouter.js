const express = require("express");
const router = express.Router();
const ctrl = require("../Controllers/roomController.js");

router.use("/add", ctrl.addRoom);
router.use("/postAdd", ctrl.postAddRoom);
router.use("/edit/:RoomId", ctrl.editRoom);
router.use("/postEdit", ctrl.postEditRoom);
router.use("/delete/:RoomId", ctrl.deleteRoom);
router.use("/", ctrl.getRooms);

module.exports = router;