const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Admin123',
    database: 'sgae',
    port: 3306 //puerto del server
});

module.exports = pool;