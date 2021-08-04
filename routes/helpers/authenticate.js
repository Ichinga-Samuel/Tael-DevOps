const User = require("../../models/Users");

function setUser(req, res, next){
    res.locals.user = {name:'', id:'', isAdmin: false};
    try{
        if(req.user && req.user._id){
            res.locals.user.isAuthenticated = true;
            res.locals.user.isAdmin = !!req.user.admin
            res.locals.user = {...res.locals.user, ...req.user}
            delete res.locals.user.password;
            return next()
        }
        res.locals.user.isAuthenticated = false;
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



module.exports = {setUser, isUser, isAdmin}
