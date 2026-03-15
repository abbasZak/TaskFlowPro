const express = require("express");
const router = express.Router();
const { createNewProject, getUserProjects }  = require("../controllers/projectController.js");
const verifyToken = require("../middlewares/verifyToken.js");


router.post('/create-project', verifyToken,  createNewProject);
router.get('/get-user-project', verifyToken, getUserProjects);

module.exports = router;