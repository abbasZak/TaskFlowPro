// test-mysql.js
const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect((err) => {
    if (err) {
        console.error('❌ MySQL connection failed:', err);
    } else {
        console.log('✅ MySQL connected successfully');
        
        // Test query
        connection.query('SELECT 1 as test', (err, results) => {
            if (err) {
                console.error('❌ Query failed:', err);
            } else {
                console.log('✅ Query successful:', results);
            }
            connection.end();
        });
    }
});