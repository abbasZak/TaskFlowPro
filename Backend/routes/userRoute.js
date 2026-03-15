const getUserInfo = require("../controllers/userController.js");
const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken.js");

router.get("/getUserInfo", verifyToken, getUserInfo);

module.exports = router;