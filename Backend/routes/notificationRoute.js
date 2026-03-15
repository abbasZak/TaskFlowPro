const express = require("express");
const router = express.Router();
const { inviteTeamMember  } = require("../controllers/notificationController.js");

router.post("/inviteMember", inviteTeamMember);