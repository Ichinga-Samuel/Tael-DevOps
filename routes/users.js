const express = require('express');
const Users = require('../models/Users');
const {genPwd} = require('../config/pass');

const router = express.Router();

router.post('/create', async (req, res, next) => {
  let fields = {'name': 1, 'email': 1, 'fave': 1, 'reviews': 1, 'id': 1}
  try {
    let user = req.body;
    user.password = genPwd(user.password);
    delete user.cpassword
    let succ = await Users.create(user);
    // user = await Users.findById(succ.id).populate({path: 'fave', populate: {path: 'authors'}}).populate('reviews').select(fields);
    if (succ && req.tael) {
      res.status(201).send({msg: 'Account Created Successfully', status: true})
    }
    else{res.redirect('/login')}
  }
  catch(e){
    console.log(e)
    res.status(502).send({msg: 'Account Creation Was Not Successful', status: false});
  }

});

router.get('/create', (req, res, next) =>{
  res.render('signup');
})

router.get('/validate_email/:email', async (req, res) => {
  try{
    let email = req.params['email']
    let count = await Users.countDocuments({email: email})
    if(count > 0){res.json({status: false, msg: 'Email already in use'})}else{res.json({status: true, msg: 'Email available'})}
  }
  catch (e) {
    res.json({status: false, msg: 'Unable to validate email at the moment'})
  }

})
module.exports = router;
