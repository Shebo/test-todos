var express = require('express');
var bodyParser = require('body-parser');

var {mongoose, mongoose: {Types: {ObjectId}}} = require('./db/mongoose');
var {Todo} = require('./models/Todo');
var {User} = require('./models/User');

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
        res.status(404).send(err);
    });
});

app.post('/api/todos', function(req, res){
    var newTodo = new Todo({
        text: req.body.text
    });
    
    newTodo.save().then(function(todo){
        res.send(todo);
    }).catch(function(err){
        res.status(400).send(err);
    });
});

app.listen(3000, function(){
    console.log('Started Server on port 3000');
});

module.exports = {
    app: app
};