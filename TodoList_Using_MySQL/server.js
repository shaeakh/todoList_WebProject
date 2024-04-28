const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const { log } = require('console');

app.use(cors());
app.use(express.json());
const PORT = 3000;


const db = mysql.createConnection({
    user: 'root',
    host: 'localhost',
    password: '',
    database: 'todolist_webproject',
});

app.get('/users', (req, res) => {
    const sqlSelect = "SELECT * FROM tbl_users";
    db.query(sqlSelect, (err, result) => {
        res.send(result);
    });
});

app.get('/tasks/:u_id', (req, res) => {
    const u_id = req.params.u_id;
    const sqlSelect = "SELECT * FROM `tbl_task` WHERE u_id = "+`${u_id}`+";";
    console.log(sqlSelect);
    db.query(sqlSelect, (err, result) => {
        res.send(result);
    });
});

app.post('/users', (req, res) => {     
    const sqlInsert = "INSERT INTO tbl_users (u_name,email,_password,role) VALUES ('"+req.body.u_name+"','"+req.body.email+"','"+req.body._password+"','"+req.body.role+"'); ";
    db.query(sqlInsert, (err, result) => {
        res.send(result);
    });
});


const u_id = 1;
    const t_id = 3;
    const title = "title";
    const description = "description";
    const _status = "status";

    const sqlInsert = "INSERT INTO tbl_task VALUES ("+`${u_id}`+","+`${t_id}`+",'"+title+"','"+description+"','"+_status+"');";

    console.log(sqlInsert);


app.post('/tasks/:u_id', (req, res) => {
    const u_id = req.params.u_id;
    const t_id = req.body.t_id;
    const title = req.body.title;
    const description = req.body.description;
    const _status = req.body._status;

    const sqlInsert = "INSERT INTO tbl_task VALUES ("+`${u_id}`+","+`${t_id}`+",'"+title+"','"+description+"','"+_status+"');";
    db.query(sqlInsert, (err, result) => {
        res.send(result);
    });
}); // Create a new task



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
