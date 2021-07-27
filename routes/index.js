const express = require('express');
const router = express.Router();
const books = require('../models/Books');


router.get('/',(req, res) => {
  // let resp = req.resp;
  res.render("home")
});

module.exports = router;
