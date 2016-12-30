var express = require('express');
var bodyParser = require('body-parser');

var {mongoose, mongoose: {Types: {ObjectId}}} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();
const port = process.env.PORT || 3000;

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

app.listen(port, function(){
    console.log(`Started Server on port ${port}`);
});

module.exports = {
    app: app
};