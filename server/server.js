const express = require('express');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
let data = JSON.parse(fs.readFileSync('data.json'));

app.get('/tasks', (req, res) => {
  try {
    res.status(201).send(data);
  } catch (error) {
    res.status(404).json({ message: 'Task not found' });
  }
});

app.post('/tasks', (req, res) => {
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

app.put('/tasks/:id', (req, res) => {
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

app.delete('/tasks/:id', (req, res) => {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});