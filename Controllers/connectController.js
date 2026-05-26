const mysql = require("mysql2");

const pool = mysql.createPool({
    connectionLimit: 5,
    host: "localhost",
    user: "root",
    database: "HotelDB",
    password: "Student"
});

let cart = []; // Корзина бронирований

module.exports.pool = pool;
module.exports.cart = cart;