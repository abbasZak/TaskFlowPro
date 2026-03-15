const express = require("express");
const verifyToken = require("../middlewares/verifyToken.js");
const router = express.Router();

router.get('/', verifyToken, (req, res) => {
    res.send('Hello user ' + req.user.uid);
}) 

module.exports = router;