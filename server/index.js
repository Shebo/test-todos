var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/Todo');
var {User} = require('./models/User');

var app = express();

app.use(bodyParser.json());

app.post('/api/todos', function(req, res){
    var todo = new Todo({
        text: req.body.text
    });
    
    todo.save().then(function(doc){
        res.send(doc);
    }).catch(function(err){
        res.status(400).send(err);
    });
});

app.listen(3000, function(){
    console.log('Started Server on port 3000');
});