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

app.post('/tasks',(req, res) => {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});