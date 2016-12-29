const expect = require('expect');
const request = require('supertest');
const ObjectId = require('mongoose').Types.ObjectId;

var {app} = require('../server');
var {Todo} = require('../server/models/Todo');
var {User} = require('../server/models/User');

var mockTodos = [
    {
        _id: ObjectId(),
        text: 'First Test Todo'
    },
    {
        _id: ObjectId(),
        text: 'Second Test Todo'
    }
];

beforeEach(function(done){
    Todo.remove({}, function(){
        return Todo.insertMany(mockTodos).then(function(){
            done();
        });
    });
});

describe('POST /api/todos', function(){
    it('should create a new todo', function(done){
        var text = "todo test";
        request(app).post('/api/todos').send({text: text})
            .expect(200)
            .expect(function(res){
                expect(res.body.text).toBe(text);
            })
            .end(function(err, res){
                if(err) return done(err);

                Todo.find({text: text}).then(function(todos){
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch(function(err){
                    done(err);
                });
            });
    });


    it('should not create a new todo', function(done){
        request(app).post('/api/todos').send({})
            .expect(400)
            .end(function(err, res){
                if(err) return done(err);

                Todo.find().then(function(todos){
                    expect(todos.length).toBe(2);
                    done();
                }).catch(function(err){
                    done(err);
                });
            });

    });
});

describe('GET /api/todos', function(){
    it('should get all todos', function(done){
        request(app).get('/api/todos')
            .expect(200)
            .expect(function(res){
                expect(res.body.todos.length).toBe(2);
            }).end(done);
    });
});

describe('GET /api/todos/:id', function(){
    it('should get todo doc', function(done){
        request(app).get('/api/todos/'+mockTodos[0]._id.toHexString())
            .expect(200)
            .expect(function(res){
                expect(res.body.todo._id).toBe(mockTodos[0]._id.toHexString());
            }).end(done);
    });

    it('should return invalid id', function(done){
        request(app).get('/api/todos/555')
            .expect(404)
            .expect(function(res){
                expect(res.body.err).toBe("ID is not valid.");
            }).end(done);
    });

    it('should return todo not found', function(done){
        // mockTodos[0]._id
        var hexId = new ObjectId().toHexString();
        request(app).get('/api/todos/'+hexId)
            .expect(404)
            .expect(function(res){
                expect(res.body.err).toBe("ID is not found.");
            }).end(done);
    });
});