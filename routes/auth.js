const express = require('express');
const User = require('../models/Users');
const passport = require('passport');
const router = express.Router();

// Login path through front end.
router.post('/login', passport.authenticate('local'), async (req, res) => {
        if(req.user){
            if(req.tael){
                let fields = {'name': 1, 'email': 1, 'fave': 1, 'reviews': 1, 'id': 1}
                let user;
                try{
                    user = await User.findById(req.user.id).populate({path: 'fave', populate: {path: 'authors'}}).populate('reviews').select(fields);
                    res.json(user)
                }
                catch (e) {
                    console.log(e)
                    res.status(500).send({msg:'something bad happened'})
                }
            }
            else{
                res.redirect('/')
            }
        }
        else{
            if(req.tael){res.status(403).send({msg:'Check credentials and try again', status: false})}
            else{
                res.redirect('login')
            }

        }
    }
)
router.get('/login',(req, res) => {
    res.render('login', )
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('login');

})

module.exports = router;
