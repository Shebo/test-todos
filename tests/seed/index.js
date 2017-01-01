const ObjectId = require('mongoose').Types.ObjectId;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const {Todo} = require('../../server/models/todo');
const {User} = require('../../server/models/user');

const mockUsers = [
    {
        _id: new ObjectId(),
        email: 'test@example.com',
        password: 'userOnePass',
        tokens: []
    },
    {
        _id: new ObjectId(),
        email: 'test1@example.com',
        password: 'userTwoPass'
    }
];

mockUsers[0].tokens.push({
    access: 'auth',
    token: jwt.sign({_id: mockUsers[0]._id, access: 'auth'}, 'devil').toString()
});

const mockTodos = [
    {
        _id: ObjectId(),
        text: 'First Test Todo'
    },
    {
        _id: ObjectId(),
        text: 'Second Test Todo',
        completed: true,
        completedAt: 666
    }
];

const populateUsers = function(done){
    User.remove({}).then(function(){
        var userOne = new User(mockUsers[0]).save();
        var userTwo = new User(mockUsers[1]).save();
        return Promise.all([userOne, userTwo]);
    }).then(function(){
        done();
    });
};

const populateTodos = function(done){
    Todo.remove({}).then(function(){
        return Todo.insertMany(mockTodos);
    }).then(function(){
        done();
    });
};

module.exports = {
    mockTodos: mockTodos,
    populateTodos: populateTodos,
    mockUsers: mockUsers,
    populateUsers: populateUsers
};