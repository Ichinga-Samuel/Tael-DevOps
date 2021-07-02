const User = require("../../models/Users");

function setUser(req, res, next){
    res.locals.resp = {name:'', id:'', isAdmin: false};
    try{
        if(req.user && req.user._id){
            res.locals.resp.isAuthenticated = true;
            res.locals.resp.isAdmin = !!req.user.admin
            res.locals.resp.name = req.user.name;
            res.locals.resp.id = req.user._id;
            return next()
        }
        res.locals.resp.isAuthenticated = false;
        return next()
    }
    catch (e) {
        return next(e)
    }

}

async function isUser(req, res, next) {
    if(req?.user?.id){return next}
    else {res.redirect('/auth/login')}
}

function isAdmin(req, res, next) {
    try {
        if(req.user && req.user.id ){
            if (req.user.admin) {
                return next()
            } else {
                res.redirect('/auth/login')
            }
        }
        else {res.redirect('/users/create')}

        return next()
    }
    catch (e) {
        return next(e)
    }
}

function isFront(req, res, next){
    if('tael' in req.headers){req.tael = true}
    return next()
}

module.exports = {setUser, isUser, isAdmin, isFront}
