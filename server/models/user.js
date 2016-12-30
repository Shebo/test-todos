var mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

UserSchema.methods.toJSON = function(){
    return _.pick(this.toObject(), ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function(){
    var access = 'auth';
    var token = jwt.sign({_id: this._id.toHexString(), access: access }, 'devil').toString();

    this.tokens.push({
        access: access,
        token: token
    });

    return this.save().then(function(){
        return token;
    });
};

UserSchema.statics.findByToken = function(token){
    var self = this;

    return new Promise(function(resolve, reject){
        var decoded;
        
        try {
            decoded = jwt.verify(token, 'devil');
        }catch(err){
            return reject('Token is not valid');
        }
        
        resolve(decoded);
    }).then(function(decoded){
        return self.findOne({
            _id: decoded._id,
            'tokens.access': 'auth',
            'tokens.token': token,
        });
    }).then(function(user){
        return (user) ? Promise.resolve(user) : Promise.reject('User not found');
    }).catch(function(err){
        return Promise.reject(err);
    });

    // try{
    //     decoded = jwt.verify(token, 'devil');
    // }catch(e){
    //     return Promise.reject('Token is not valid');
    // }

    // return this.findOne({
    //     _id: decoded._id,
    //     'tokens.access': 'auth',
    //     'tokens.token': token,
    // });
};

var User = mongoose.model('User', UserSchema);

module.exports = {
    User: User
};