require('dotenv').config();
const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const bcript = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

const db = require('./database.js');

const PORT = 3000;
// //use schema 

// const db = mysql.createConnection({
//     user: 'root',
//     host: 'localhost',
//     password: '',
//     database: 'todolist_webproject',
// });

// implement all the features from JSON_as_DB project 
// implement status code 

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    let token = authHeader && authHeader.split(' ')[1]    
    
    if (token === null ) {
        return res.sendStatus(401)
    }    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus("this is a error \n",403)            
        req.user = user
        next()
    })
}


function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
}


app.get('/users', authenticateToken, (req, res) => {

    // implement try catch 

    if (req.user.role === "admin") {
        const sqlSelect = "SELECT * FROM tbl_users";
        db.query(sqlSelect, (err, result) => {
            res.send(result);
        });
    }
    else {
        res.send("Only admin can see the user list");
    }
});


app.delete('/users', authenticateToken, (req, res) => {
    if (req.user.role === "admin") {
        const u_name = req.body.u_name;

        const selectsql = "SELECT * FROM tbl_users WHERE u_name = '" + u_name + "';";
        console.log(selectsql);
        db.query(selectsql, (err, result) => {
            if (result.length > 0) {
                const u_id = result[0].u_id;

                let sqlDelete = "DELETE FROM tbl_task WHERE u_id = " + u_id + ";";
                
                db.query(sqlDelete, (err, result) => {
                    sqlDelete = "DELETE FROM tbl_users WHERE u_id = " + u_id + ";";
                    db.query(sqlDelete, (err, result) => {
                        res.send(result);
                    });
                });
            }
            else {
                res.send("No user found");
            }
        });
    }
    else {
        res.send("Only admin can delete a user");
    }
});


app.get('/user/profile', authenticateToken, (req, res) => {
    const u_name = req.user.u_name;
    const selectsql = "SELECT * FROM tbl_users WHERE u_name = '" + u_name + "';";
    db.query(selectsql, (err, result) => {
        res.send(result);
    })
})


app.post('/user/profile', async (req, res) => {
    try {
        const u_name = req.body.u_name;
        const email = req.body.email;
        const _password = req.body._password;

        if ((u_name == null) || (email == null) || (_password == null)) {
            res.send('u_name, email and password is required !');
            return;
        }

        // check if user already exists
        // checking username 
        let sqlSelect = "SELECT * FROM tbl_users WHERE u_name = '" + u_name + "';";
        db.query(sqlSelect, (err, result) => {
            if (result.length > 0) {
                res.send("Username already exists");
                return;
            }
        });

        // checking email
        sqlSelect = "SELECT * FROM tbl_users WHERE email = '" + email + "';";
        db.query(sqlSelect, (err, result) => {
            if (result.length > 0) {
                res.send("Email already exists");
                return;
            }
        });
        const salt = 10;
        const hashedpass = await bcript.hash(req.body._password, salt);
        const sqlInsert = "INSERT INTO tbl_users (u_name,email,_password,role) VALUES ('" + req.body.u_name + "','" + req.body.email + "','" + hashedpass + "','" + "regular_user'); ";
        db.query(sqlInsert, (err, result) => {
            res.status(201).send(result);
        });
    } catch (error) {
        res.status(500).send(error);
    }
});


app.patch('/user/profile', authenticateToken, async (req, res) => {
    const new_u_name = req.body.u_name;
    const new_email = req.body.email;
    const new_password = req.body._password;
    const current_password = req.body.current_password;

    const u_name = req.user.u_name;
    const email = req.user.email;

    const selectsql = "SELECT * FROM tbl_users WHERE u_name = '" + u_name + "';";
    db.query(selectsql, async (err, result) => {

        validpass = await bcript.compare(current_password, result[0]._password);
        if (validpass) {
            const u_id = result[0].u_id;

            let updateSql;

            if (new_u_name != null && new_u_name != u_name) {
                updateSql = "UPDATE tbl_users SET u_name = '" + new_u_name + "' WHERE u_id = " + `${u_id}` + " ;"
                db.query(updateSql, (err, result) => { })
            }

            if (new_email != null && new_email != email) {
                updateSql = "UPDATE tbl_users SET email = '" + new_email + "' WHERE u_id = " + `${u_id}` + " ;"
                db.query(updateSql, (err, result) => { })
            }

            if (new_password != null) {
                const salt = 10;
                const hashedpass = await bcript.hash(new_password, salt);
                updateSql = "UPDATE tbl_users SET _password = '" + hashedpass + "' WHERE u_id = " + `${u_id}` + " ;"
                db.query(updateSql, (err, result) => { })
            }

            const selectsql = "SELECT * FROM tbl_users WHERE u_id = " + `${u_id}` + " ;"
            db.query(selectsql, (err, result) => {
                res.send(result);
            })
        }
        else {
            res.send("sorry wrong password");
        }

    })
});


app.delete('/user/profile', authenticateToken, (req, res) => {
    const u_name = req.user.u_name;
    const current_password = req.body.current_password;
    console.log(current_password);
    let selectsql = "SELECT * FROM tbl_users WHERE u_name = '" + u_name + "';";
    db.query(selectsql, async (err, result) => {
        
        const validpass = await bcript.compare(current_password, result[0]._password);
        if (validpass) {
            const u_id = result[0].u_id;            
            let sqlDelete = "DELETE FROM tbl_task WHERE u_id = " + u_id + ";";
            console.log(sqlDelete);
            db.query(sqlDelete, (err, result) => {
                sqlDelete = "DELETE FROM tbl_users WHERE u_id = " + u_id + ";";
                db.query(sqlDelete, (err, result) => {
                    res.send(result);
                });
            });                
        }
        else {
            res.send("password invalid");
        }
    });
})


app.get('/tasks',authenticateToken, (req, res) => {
    if (req.user.role === "admin") {
        const sqlSelect = "SELECT * FROM `tbl_task` ;";
        const r = null;
        db.query(sqlSelect, (err, result) => {            
            res.send(result);
        });
    }
    else {
        res.send("only an admin can see all the tasks");
    }    
});


app.get('/users/tasks', authenticateToken, (req, res) => {
    const u_name = req.user.u_name;
    let sqlSelect = "SELECT * FROM `tbl_users` WHERE u_name = '" + `${u_name}` + "';";
    db.query(sqlSelect, (err, result) => {
        sqlSelect = "SELECT * FROM `tbl_task` WHERE u_id = " + `${result[0].u_id}` + ";";
        db.query(sqlSelect, (err, u_tasks) => {
            res.send(u_tasks);
        })
    });
});

app.get('/users/tasks/sorted_id', authenticateToken, (req, res) => {
    const u_name = req.user.u_name;
    let sqlSelect = "SELECT * FROM `tbl_users` WHERE u_name = '" + `${u_name}` + "';";
    db.query(sqlSelect, (err, result) => {
        sqlSelect = "SELECT * FROM `tbl_task` WHERE u_id = " + `${result[0].u_id}` + ";";        
        db.query(sqlSelect, (err, u_tasks) => {
            u_tasks.sort((a, b) => a.t_id - b.t_id);
            res.send(u_tasks);
        })
    });  
});

app.get('/users/tasks/sorted_staus', authenticateToken, (req, res) => {
    const u_name = req.user.u_name;
    let sqlSelect = "SELECT * FROM `tbl_users` WHERE u_name = '" + `${u_name}` + "';";
    db.query(sqlSelect, (err, result) => {
        sqlSelect = "SELECT * FROM `tbl_task` WHERE u_id = " + `${result[0].u_id}` + " ORDER BY `tbl_task`.`_status` ASC;";        
        db.query(sqlSelect, (err, u_tasks) => {
            res.send(u_tasks);
        })
    });  
});

app.get('/users/tasks/:t_id', authenticateToken, (req, res) => {
    const u_name = req.user.u_name;
    const t_id = req.params.t_id;
    let sqlSelect = "SELECT * FROM `tbl_users` WHERE u_name = '" + `${u_name}` + "';";
    db.query(sqlSelect, (err, result) => {
        sqlSelect = "SELECT * FROM `tbl_task` WHERE u_id = " + `${result[0].u_id}` + "&& t_id = "+`${t_id}`+" ;";
        db.query(sqlSelect, (err, ut_tasks) => {
            res.send(ut_tasks);
        })
    });
});


app.post('/users/tasks', authenticateToken, (req, res) => {
    const u_name = req.user.u_name;
    let sqlSelect = "SELECT * FROM `tbl_users` WHERE u_name = '" + `${u_name}` + "';";
    db.query(sqlSelect, (err, result) => {
        const u_id = result[0].u_id;
        sqlSelect = "SELECT * FROM `tbl_task` WHERE u_id = " + `${result[0].u_id}` + ";";
        db.query(sqlSelect, (err, result) => {

            const t_id = result.length + 1;
            const title = req.body.title;
            const description = req.body.description;
            const _status = req.body._status;

            const sqlInsert = "INSERT INTO tbl_task VALUES (" + `${u_id}` + "," + `${t_id}` + ",'" + title + "','" + description + "','" + _status + "');";
            db.query(sqlInsert, (err, result) => {
                res.send(result);
            });
        });
    });
});

app.patch('/users/tasks/:t_id', authenticateToken, (req, res) => {
    const new_title = req.body.title;
    const new_description = req.body.description;
    const new_status = req.body._status;
    const t_id = req.params.t_id;

    if(new_title === null && new_description === null && new_status === null){
        res.send("invalid update");
        return;
    }
    
    const u_name = req.user.u_name;
    let sqlSelect = "SELECT * FROM `tbl_users` WHERE u_name = '" + `${u_name}` + "';";
    db.query(sqlSelect, (err, result) => {
        const u_id = result[0].u_id;
        let updateSql;

        // UPDATE tbl_task 
        // SET title = 'hi this is new shaeakh'
        // WHERE u_id = 9 && t_id = 1 ;


        if(new_title!=null){
            updateSql = "UPDATE tbl_task SET title = '"+new_title+"' WHERE u_id = "+`${u_id}`+" &&  t_id = "+`${t_id}`+" ;"
            db.query(updateSql, (err, result) => { })
        }
        if(new_description!=null){
            updateSql = "UPDATE tbl_task SET description = '"+new_description+"' WHERE u_id = "+`${u_id}`+" &&  t_id = "+`${t_id}`+" ;"
            db.query(updateSql, (err, result) => { })
        }
        if(new_status!=null){
            updateSql = "UPDATE tbl_task SET _status = '"+new_status+"' WHERE u_id = "+`${u_id}`+" &&  t_id = "+`${t_id}`+" ;"
            db.query(updateSql, (err, result) => { })
        }
        // sqlSelect = "SELECT * FROM `tbl_task` WHERE u_id = " + `${u_id}` + ";";
        // db.query(sqlSelect, (err, result) => {})

        const selectsql = "SELECT * FROM tbl_task WHERE u_id = "+`${u_id}`+" &&  t_id = "+`${t_id}`+" ;"
            db.query(selectsql, (err, result) => {
                res.send(result);
            })
    })



});

app.delete('/users/tasks/:t_id', authenticateToken, (req, res) => {
    const t_id = req.params.t_id;
    const u_name = req.user.u_name;
    let selectsql = "SELECT * FROM tbl_users WHERE u_name = '" + u_name + "';";
    db.query(selectsql, async (err, result) => {
        const u_id = result[0].u_id;                    
        let sqlDelete = "DELETE FROM tbl_task WHERE u_id = " + `${u_id}` + " &&  t_id = "+ `${t_id}` +";";
        db.query(sqlDelete,(err,result)=>{
            res.send(result);
        });
    });
});

app.post('/users/login', async (req, res) => {
    const u_name = req.body.u_name;    
    const password = req.body._password;
    const sqlSelect = "SELECT * FROM tbl_users WHERE u_name = '" + u_name + "';";    
    db.query(sqlSelect, async (err, result) => {
        try {
            if (err) {
                res.status(500).send("hehehe",err);
                return;
            }
            if (result.length > 0) {
                const validpass = await bcript.compare(password, result[0]._password);
                if (validpass) {
                    const user = {
                        u_name: result[0].u_name,
                        role: result[0].role
                    };
                    const Token = generateAccessToken(user) 
                    res.status(201).send({status : "Succesfully Logged in ",Token : Token});
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

app.delete('/users/login', (req, res) => {
    res.send("Logged out");
})

app.patch('/role_cng', authenticateToken, (req, res) => {

    if (req.user.role === "admin") {
        if ((req.body.u_name != null) && (req.body.role != null)) {
            const sqlSetrole = "UPDATE tbl_users SET role = '" + req.body.role + "' WHERE u_name = '" + req.body.u_name + "'; ";
            
            db.query(sqlSetrole, (err, update) => {
                res.send(update);
            })
        }
        else {
            res.send('user_name and status is required !');
        }
    }
    else {
        res.send("Only admins have access");
    }

});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
