const _ = require('lodash');
const bcrypt = require('bcryptjs');
const express = require('express');
const bodyParser = require('body-parser');

require('../config');

var {mongoose, mongoose: {Types: {ObjectId}}} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/auth');

const port = process.env.PORT;
var app = express();

app.use(bodyParser.json());

// get all todos
app.get('/api/todos', authenticate, function(req, res){
    Todo.find({
        _userId: req.user._id
    }).then(function(todos){
        res.send({todos: todos});
    }).catch(function(err){
        res.status(400).send(err);
    });
});

// get a todo by it's ID
app.get('/api/todos/:id', authenticate, function(req, res){

    return new Promise(function(resolve, reject){
        if(ObjectId.isValid(req.params.id)){
            resolve();
        }else{
            reject('ID is not valid.');
        }
    }).then(function(){
        return Todo.findOne({
            _id: req.params.id,
            _userId: req.user._id
        });
    }).then(function(todo){
        return (todo) ? Promise.resolve(todo) : Promise.reject('ID is not found.');
    }).then(function(todo){
        res.send({todo: todo});
    }).catch(function(err){
        res.status(404).send({err: err});
    });
});

app.post('/api/todos', authenticate, function(req, res){
    var newTodo = new Todo({
        text: req.body.text,
        _userId: req.user._id
    });
    
    newTodo.save().then(function(todo){
        res.send(todo);
    }).catch(function(err){
        res.status(400).send({err: err});
    });
});

app.patch('/api/todos/:id', authenticate, function(req, res){
    return new Promise(function(resolve, reject){
        if(ObjectId.isValid(req.params.id)){
            resolve();
        }else{
            reject('ID is not valid.');
        }
    }).then(function(){
        var completedAt = null;
        if(_.isBoolean(req.body.completed) && req.body.completed ){
            completedAt = new Date().getTime();
        }
        return Todo.findOneAndUpdate({
            _id: req.params.id,
            _userId: req.user.id
        }, {
            text: req.body.text,
            completed: req.body.completed,
            completedAt: completedAt
        }, {new: true});
    }).then(function(todo){
        return (todo) ? Promise.resolve(todo) : Promise.reject('ID is not found.');
    }).then(function(todo){
        res.send({todo: todo});
    }).catch(function(err){
        res.status(404).send({err: err});
    });
});

app.delete('/api/todos/:id', authenticate, function(req, res){
    return new Promise(function(resolve, reject){
        if(ObjectId.isValid(req.params.id)){
            resolve();
        }else{
            reject('ID is not valid.');
        }
    }).then(function(){
        return Todo.findOneAndRemove({
            _id: req.params.id,
            _userId: req.user._id
        });
    }).then(function(todo){
        return (todo) ? Promise.resolve(todo) : Promise.reject('ID is not found.');
    }).then(function(todo){
        res.send({todo: todo});
    }).catch(function(err){
        res.status(404).send({err: err});
    });
});

app.post('/api/users', function(req, res){
    var user = new User(_.pick(req.body, ['email', 'password']));
    
    user.save().then(function(){
        return user.generateAuthToken();
    }).then(function(token){
        res.header('x-auth', token).send({user: user});
    }).catch(function(err){
        res.status(400).send({err: err});
    });
});

app.get('/api/users/me', authenticate, function(req, res){
    res.send({user: req.user});
});

app.post('/api/users/login', function(req, res){
    var body = _.pick(req.body, ['email', 'password']);
    
    User.findByCredentials(body.email, body.password).then(function(user){
        return user.generateAuthToken().then(function(token){
            res.header('x-auth', token).send({user: user});
        });
    }).catch(function(err){
        res.status(400).send({err: err});
    });
});

app.delete('/api/users/me/token', authenticate, function(req, res){
    req.user.removeToken(req.token).then(function(){
        res.status(200).send();
    }).catch(function(){
        res.status(400).send();
    });
});

app.listen(port, function(){
    console.log(`Started Server on port ${port}`);
});

module.exports = {
    app: app
};