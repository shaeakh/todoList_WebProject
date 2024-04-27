const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
let data = JSON.parse(fs.readFileSync('data.json'));

const validateTask_POST_PUT_Method = (req, res, next) => {
  const { title, description, status } = req.body;

  // Check if title, description, and status are provided
  if (!title || !description || !status) {
    return res.status(400).json({ message: 'Title, description, and status are required' });
  }
  next();
};

const statusRank = {
  "TO DO": 1,
  "In Progress": 2,
  "Completed": 3
};


app.get('/taskList', (req, res) => {
  try {
    res.status(201).send(data);
  } catch (error) {
    res.status(404).json({ message: 'Task not found' });
  }
});

app.get('/taskList/sortById', (req, res) => {
  try {
    const sortedTasks = data.slice().sort((a, b) => a.id - b.id);
    res.status(201).json(sortedTasks);
  } catch (error) {
    res.status(404).json({ message: 'Task not found' });
  }
});

app.get('/taskList/sortByStatus', (req, res) => {
  try {
    const sortedTasks = data.sort((a, b) => statusRank[a.status] - statusRank[b.status]);
    res.status(201).json(sortedTasks);
  } catch (error) {
    res.status(404).json({ message: 'Task not found' });
  }
});

app.get('/taskList/search', (req, res) => {
  try {
    const { q } = req.query;
    const searchResults = data.filter(task => task.title.toLowerCase().includes(q.toLowerCase()) || task.description.toLowerCase().includes(q.toLowerCase()));
    res.status(201).json(searchResults);
  } catch (error) {
    res.status(404).json({ message: 'Task not found' });
  }
});

app.post('/taskList',validateTask_POST_PUT_Method, (req, res) => {
  try {
    const newTask = {
      id: data.length + 1,
      title: req.body.title,
      description: req.body.description,
      status: req.body.status
    }
    data.push(newTask);
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    res.status(201).json(data);
  } catch (error) {
    res.status(404).json({ message: "Task didn't posted" });
  }
});

app.put('/taskList/:id',validateTask_POST_PUT_Method, (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const updatedTask = req.body;
    const taskIndex = data.findIndex(task => task.id === taskId);

    if (taskIndex !== -1) {
      data[taskIndex] = { ...data[taskIndex], ...updatedTask };
      fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
      res.status(201).json(data);
    } else {
      res.status(404).json({ message: "Task doesn't exist " });
    }
  } catch (error) {
    res.status(404).json({ message: "Task didn't replaced " });
  }
});

app.delete('/taskList/:id', (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const taskIndex = data.findIndex(task => task.id === taskId);

    if (taskIndex !== -1) {
      data.splice(taskIndex, 1);
      fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
      res.status(201).json(data);
    } else {
      res.status(404).json({ message: "Task doesn't exist " });
    }
  } catch (error) {
    res.status(404).json({ message: "Task didn't deleted " });
  }
});


app.patch('/taskList/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const updates = req.body;
  const taskIndex = data.findIndex(task => task.id === taskId);

  try {
    if (taskIndex !== -1) {    
      data[taskIndex] = { ...data[taskIndex], ...updates };    
      fs.writeFileSync('data.json', JSON.stringify(data, null, 2));    
      res.status(200).json(data);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(404).json({ message: "Task didn't updated" });
  }  
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});