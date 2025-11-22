const express = require('express');
const authMiddleware = require('./app/middleware/auth.middleware');
const usersController = require('./app/users/users.controller');
const listsController = require('./app/lists/lists.controller');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('It works!');
});

app.use('/api/v1/users', authMiddleware, usersController);
app.use('/api/v1/lists', authMiddleware, listsController);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
