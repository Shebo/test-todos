var mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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
    var token = jwt.sign({_id: this._id.toHexString(), access: access }, process.env.JWT_SECRET).toString();

    this.tokens.push({
        access: access,
        token: token
    });

    return this.save().then(function(){
        return token;
    });
};

UserSchema.methods.removeToken = function(token){
    this.tokens.push({
        access: 'auth',
        token: token
    });

    return this.update({
        $pull: {
            tokens: {
                token: token
            }
        }
    });
};

UserSchema.statics.findByToken = function(token){
    var self = this;

    return new Promise(function(resolve, reject){
        var decoded;
        
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
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
};

UserSchema.statics.findByCredentials = function(email, password){
    var self = this;

    return self.findOne({email: email}).then(function(user){
        if(!user) return Promise.reject('No User is using this email');

        return new Promise(function(resolve, reject){
            bcrypt.compare(password, user.password, function(err, res){
                if(err || !res){
                    reject('Password Don\'t Match Email');
                }else{
                    resolve(user);
                }
            });
        });
    });
};

UserSchema.pre('save', function(next){
    var self = this;

    if(self.isModified('password')){
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(self.password, salt, function(err, hash) {
                self.password = hash;
                next();
            });
        });
    }else{
        next();
    }
});

var User = mongoose.model('User', UserSchema);

module.exports = {
    User: User
};