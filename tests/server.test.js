const expect = require('expect');
const request = require('supertest');
const ObjectId = require('mongoose').Types.ObjectId;

var {app} = require('../server');
var {Todo} = require('../server/models/todo');
var {User} = require('../server/models/user');
var {mockTodos, populateTodos, mockUsers, populateUsers} = require('./seed');

beforeEach(populateTodos);
beforeEach(populateUsers);

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

describe('PATCH /api/todos/:id', function(){
    it('should update todo doc', function(done){
        var updatedText = 'updated text';
        request(app).patch('/api/todos/'+mockTodos[0]._id.toHexString()).send({text: updatedText, completed: true})
            .expect(200)
            .expect(function(res){
                expect(res.body.todo._id).toBe(mockTodos[0]._id.toHexString());
                expect(res.body.todo.text).toBe(updatedText);
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toBeA('number');
            }).end(done);
    });

    it('should clear completedAt when todo is not completed', function(done){
        var updatedText = 'updated text2';
        request(app).patch('/api/todos/'+mockTodos[1]._id.toHexString()).send({text: updatedText, completed: false})
            .expect(200)
            .expect(function(res){
                expect(res.body.todo._id).toBe(mockTodos[1]._id.toHexString());
                expect(res.body.todo.text).toBe(updatedText);
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toNotExist();
            }).end(done);
    });

    it('should return invalid id', function(done){
        request(app).patch('/api/todos/555')
            .expect(404)
            .expect(function(res){
                expect(res.body.err).toBe("ID is not valid.");
            }).end(done);
    });

    it('should return todo not found', function(done){
        // mockTodos[0]._id
        var hexId = new ObjectId().toHexString();
        request(app).patch('/api/todos/'+hexId)
            .expect(404)
            .expect(function(res){
                expect(res.body.err).toBe("ID is not found.");
            }).end(done);
    });
});

describe('DELETE /api/todos/:id', function(){
    it('should delete todo doc', function(done){
        request(app).delete('/api/todos/'+mockTodos[0]._id.toHexString())
            .expect(200)
            .expect(function(res){
                expect(res.body.todo._id).toBe(mockTodos[0]._id.toHexString());
            }).end(function(err, res){
                if(err) return done(err);

                Todo.findById(mockTodos[0]._id.toHexString()).then(function(todo){
                    expect(todo).toNotExist();
                    done();
                }).catch(function(err){
                    done(err);
                });
            });
    });

    it('should return invalid id', function(done){
        request(app).delete('/api/todos/555')
            .expect(404)
            .expect(function(res){
                expect(res.body.err).toBe("ID is not valid.");
            }).end(done);
    });

    it('should return todo not found', function(done){
        // mockTodos[0]._id
        var hexId = new ObjectId().toHexString();
        request(app).delete('/api/todos/'+hexId)
            .expect(404)
            .expect(function(res){
                expect(res.body.err).toBe("ID is not found.");
            }).end(done);
    });
});

describe('GET /api/users/me', function(){
    it('should get my user if authenticated', function(done){
        request(app).get('/api/users/me').set('x-auth', mockUsers[0].tokens[0].token)
            .expect(200)
            .expect(function(res){
                expect(res.body.user._id).toBe(mockUsers[0]._id.toHexString());
                expect(res.body.user.email).toBe(mockUsers[0].email);
            }).end(done);
    });

    it('should return 401 if not authenticated', function(done){
        request(app).get('/api/users/me')
            .expect(401)
            .expect(function(res){
                expect(res.body.err).toBe('Token is not valid');
            }).end(done);
    });
});

describe('POST /api/users', function(){
    it('should create a new user', function(done){
        var email = "example@example.com";
        var password = "testPassword";
        request(app).post('/api/users').send({email: email, password: password})
            .expect(200)
            .expect(function(res){
                expect(res.header['x-auth']).toExist();
                expect(res.body.user._id).toExist();
                expect(res.body.user.email).toBe(email);
            })
            .end(function(err, res){
                if(err) return done(err);

                User.findOne({email: email}).then(function(user){
                    expect(user).toExist();
                    expect(user.email).toBe(email);
                    expect(user.password).toNotBe(password);
                    done();
                }).catch(function(err){
                    done(err);
                });
            });
    });


    it('should return validation errors if request invalid', function(done){
        var email = "example@example";
        var password = "123";
        request(app).post('/api/users').send({email: email, password: password})
            .expect(400)
            .end(done);
    });

    it('should not create user if email in use', function(done){
        var email = mockUsers[0].email;
        var password = "123";
        request(app).post('/api/users').send({email: email, password: password})
            .expect(400)
            .end(done);
    });
});