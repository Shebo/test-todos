const expect = require('expect');
const request = require('supertest');

var {app} = require('../server');
var {Todo} = require('../server/models/Todo');
var {User} = require('../server/models/User');

beforeEach(function(done){
    Todo.remove({}, function(){
        done();
    });
});

describe('POST /todos', function(){
    it('should create a new todo', function(done){
        var text = "todo test";
        request(app).post('/api/todos').send({text: text})
            .expect(200)
            .expect(function(res){
                expect(res.body.text).toBe(text);
            })
            .end(function(err, res){
                if(err) return done(err);

                Todo.find().then(function(todos){
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
                    expect(todos.length).toBe(0);
                    done();
                }).catch(function(err){
                    done(err);
                });
            });

    });
});