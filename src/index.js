const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const findUser = users.find(user => user.username === username.trim());

  if (!findUser) {
    return response.status(400).json({ error: 'We can\'t find the user.' });
  }

  request.user = findUser;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  if (!name || !username) {
    return response.status(400).json({ error: 'The user should has a name ans an username.' });
  }

  if (users.find(user => user.username === username.trim())) {
    return response.status(400).json({ error: 'This username has already be taken.' });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  }

  users.push(user);

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request

  let findTodo = user.todos.find(todo => todo.id === id);

  if (!findTodo) {
    return response.status(404).send({ error: "We can\'t find a TODO" });
  }

  findTodo.title = title;
  findTodo.deadline = new Date(deadline);

  return response.status(200).send(findTodo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {

  const { id } = request.params;
  const { user } = request

  let findTodo = user.todos.find(todo => todo.id === id);

  if (!findTodo) {
    return response.status(404).send({ error: "We can\'t find a TODO" });
  }

  findTodo.done = true;

  return response.status(200).send(findTodo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {

  const { id } = request.params;
  const { user } = request

  let findTodo = user.todos.find(todo => todo.id === id);

  if (!findTodo) {
    return response.status(404).send({ error: "We can\'t find a TODO" });
  }

  user.todos.splice(findTodo, 1)

  return response.status(204).send();
});

module.exports = app;