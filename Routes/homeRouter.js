const express = require("express");
const router = express.Router();
const homeController = require("../Controllers/homeController.js");

router.get("/about", homeController.about);
router.get("/", homeController.index);

module.exports = router;