const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(users => users.username === username);

  if (!user) {
    return response.status(400).json({
      errorMessage: "username does not exists"
    });
  }

  request.user = user;

  next();
}

app.post('/users', (request, response) => {
  const { username, name } = request.body;

  const userAlreadyExists = users.some(users => users.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({
      error: "username already exists"
    });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  
  const { todos } = users.find(users => users.username === user.username);
  
  return response.json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo);
  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = user.todos.find(todos => todos.id === id);

  if(!todo) {
    return response.status(404).json({
      error: 'todo not found'
    })
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todos => todos.id === id);

  if(!todo) {
    return response.status(404).json({
      error: 'todo not found'
    })
  }

  todo.done = true;

  return response.status(200).send(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  let todoIndex = user.todos.map((element) => element.id).indexOf(id);

  if(todoIndex === -1) {
    return response.status(404).json({
      error: 'todo not found'
    })
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;