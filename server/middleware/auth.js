var {User} = require('./../models/user.js');

var authenticate = function(req, res, next){
    var token = req.header('x-auth');

    User.findByToken(token).then(function(user){
        req.user = user;
        req.token = token;
        next();
    }).catch(function(err){
        res.status(401).send({err: err});
    });
};

module.exports = {
    authenticate: authenticate
};