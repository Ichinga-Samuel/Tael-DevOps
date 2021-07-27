const express = require('express');
const User = require('../models/Users');
const passport = require('passport');
const router = express.Router();

// Login path through front end.
router.post('/login', passport.authenticate('local', {failureRedirect: '/auth/login', successRedirect: "/"}));

router.get('/login',(req, res) => {
    res.render('login', )
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('login');

})

module.exports = router;
