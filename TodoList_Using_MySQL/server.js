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

    const sqlInsert = "INSERT INTO tbl_users (u_name,email,_password,role) VALUES ('"+"','"+"','"+"','"+"'); ";
    db.query(sqlInsert, (err, result) => {
        console.log(result);
    });
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
