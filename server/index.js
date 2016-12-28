var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/Todo');
var {User} = require('./models/User');

var app = express();

app.use(bodyParser.json());

app.get('/api/todos', function(req, res){
    Todo.find().then(function(todos){
        res.send({todos: todos});
    }).catch(function(err){
        res.status(400).send(err);
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