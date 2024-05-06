const mysql = require('mysql');

const database = mysql.createConnection({
    user: 'root',
    host: 'localhost',
    password: '',
    database: 'todolist_webproject2',
});

database.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});


const create_tbl_user = `
CREATE TABLE IF NOT EXISTS tbl_users(
	u_id int AUTO_INCREMENT PRIMARY KEY,
    	u_name varchar(200),
	email varchar(200),
	_password varchar(200),
	role varchar(200)
);
`;

// Create user table if not exists
database.query(create_tbl_user, (err) => {
  if (err) {
    console.error('Error creating user table: \n', err);
  } else {
    console.log('users table already exists\n');
  }
});

const create_tbl_task = `
CREATE TABLE IF NOT EXISTS tbl_task(
	u_id int,
    t_id int,
    title varchar(200),
    description varchar(1000),
    _status varchar(20),
    
    FOREIGN KEY (u_id) REFERENCES tbl_users(u_id)
);
`;

database.query(create_tbl_task, (err) => {
  if (err) {
    console.error('Error creating "tasks" table:', err);
  } else {
    console.log('"tasks" table created (or already exists)');
  }
});


module.exports = database;