require('dotenv').config();
const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const { log } = require('console');
const bcript = require('bcrypt');
const jwt = require('jsonwebtoken');
const { dot } = require('node:test/reporters');

app.use(cors());
app.use(express.json());
const PORT = 3000;


const db = mysql.createConnection({
    user: 'root',
    host: 'localhost',
    password: '',
    database: 'todolist_webproject',
});

function generateAccessToken(user){
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn : '15s'});
}

app.get('/users', (req, res) => {
    const sqlSelect = "SELECT * FROM tbl_users";
    db.query(sqlSelect, (err, result) => {
        
        res.send(result);
    });
});

app.get('/tasks', (req, res) => {    
    const sqlSelect = "SELECT * FROM `tbl_task` ;";   
    const r = null; 
    db.query(sqlSelect, (err, result) => {
        console.log(result);
        res.send(result);        
    });
    
});

app.get('/tasks/:u_id', (req, res) => {
    const u_id = req.params.u_id;
    const sqlSelect = "SELECT * FROM `tbl_task` WHERE u_id = "+`${u_id}`+";";    
    db.query(sqlSelect, (err, result) => {
        res.send(result);
    });
});

app.post('/users', async (req, res) => {   
    
    try {
        const salt = 10;
        const hashedpass = await bcript.hash(req.body._password, salt);
        const sqlInsert = "INSERT INTO tbl_users (u_name,email,_password,role) VALUES ('"+req.body.u_name+"','"+req.body.email+"','"+hashedpass+"','"+req.body.role+"'); ";
        db.query(sqlInsert, (err, result) => {
        res.status(201).send(result);
         });
    } catch (error) {
        res.status(500).send(error);
    }
});

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
}); 

app.post('/users/login', async (req, res) => {
    const u_name = req.body.u_name;
    const password = req.body._password;
    const sqlSelect = "SELECT * FROM tbl_users WHERE u_name = '"+u_name+"';";
    db.query(sqlSelect, async (err, result) => {
        try {
            if (err) {
                res.status(500).send(err);
                return;
            }
            if (result.length > 0) {
                const validpass = await bcript.compare(password, result[0]._password);
                if (validpass) {
                    const user = {u_name: u_name};
                    const Token = generateAccessToken(user)
                    const refreshToken = jwt.sign(user,process.env.REFRESH_TOKEN_SECRET)
                    res.status(201).send({Token: Token, refreshToken: refreshToken});
                } else {
                    res.status(400).send('Invalid Password');
                }
            } else {
                res.status(400).send('Invalid Username');
                return;
            }   
        } catch (error) {
            res.status(500).send('Request Error');
        } 
    }
    );
}); 

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
