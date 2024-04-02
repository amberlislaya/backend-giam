const { Router } = require("express");
const {sendEmail} = require("../controller/email.controller.js");


const router = Router();


router.post('/', sendEmail);






module.exports = router;