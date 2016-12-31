const _ = require('lodash');
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
app.get('/api/todos', function(req, res){
    Todo.find().then(function(todos){
        res.send({todos: todos});
    }).catch(function(err){
        res.status(400).send(err);
    });
});

// get a todo by it's ID
app.get('/api/todos/:id', function(req, res){

    return new Promise(function(resolve, reject){
        if(ObjectId.isValid(req.params.id)){
            resolve();
        }else{
            reject('ID is not valid.');
        }
    }).then(function(){
        return Todo.findById(req.params.id);
    }).then(function(todo){
        return (todo) ? Promise.resolve(todo) : Promise.reject('ID is not found.');
    }).then(function(todo){
        res.send({todo: todo});
    }).catch(function(err){
        res.status(404).send({err: err});
    });
});

app.post('/api/todos', function(req, res){
    var newTodo = new Todo({
        text: req.body.text
    });
    
    newTodo.save().then(function(todo){
        res.send(todo);
    }).catch(function(err){
        res.status(400).send({err: err});
    });
});

app.patch('/api/todos/:id', function(req, res){
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
        return Todo.findByIdAndUpdate(req.params.id, {
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

app.delete('/api/todos/:id', function(req, res){
    return new Promise(function(resolve, reject){
        if(ObjectId.isValid(req.params.id)){
            resolve();
        }else{
            reject('ID is not valid.');
        }
    }).then(function(){
        return Todo.findByIdAndRemove(req.params.id);
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

app.listen(port, function(){
    console.log(`Started Server on port ${port}`);
});

module.exports = {
    app: app
};