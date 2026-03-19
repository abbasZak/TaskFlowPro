const express = require("express");
const router = express.Router();
const { sendInvitation }  = require("../controllers/invitationController.js");
const verifyToken   = require("../middlewares/verifyToken.js");

router.post("/:projectId/sendInvitation", verifyToken, sendInvitation);


module.exports = router;    