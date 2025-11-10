const { Pool } = require('pg');

require('dotenv').config();
const pool  = new Pool({
    connectionString: process.env.POSTGRES_URL,
});

// const DBSOURCE_1 = process.env.DB_SOURCE_1 || "db.sqlite";
// const DBSOURCE_2 = process.env.DB_SOURCE_2 || "db.sqlite";

// const dbMovies = new sqlite3.Database(DBSOURCE_1, (err) => {
//     if (err) {
//         console.error("Gagal koneksi ke database:", err.message);
//         throw err;
//     } else {
//         console.log('Connected to the SQLite database.');

//         // Buat tabel movies
//         dbMovies.run(`CREATE TABLE IF NOT EXISTS movies (
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             title TEXT NOT NULL,
//             director TEXT NOT NULL, 
//             year INTEGER NOT NULL
//         );`, (err) => {
//             if (err) {
//                 console.error("Gagal membuat tabel movies:", err.message);
//             } else {
//                 console.log("Tabel 'movies' siap digunakan.");
//                 // Cek apakah data sudah ada sebelum seeding
//                 dbMovies.get("SELECT COUNT(*) as count FROM movies", (err, row) => {
//                     if (err) {
//                         console.error("Gagal mengecek data awal:", err.message);
//                     } else if (row.count === 0) {
//                         console.log("Seeding data awal ke tabel 'movies'...");
//                         const insert = 'INSERT INTO movies (title, director, year) VALUES (?,?,?)';
//                         dbMovies.run(insert, ["Moana", "Don Hall", 2016]);
//                         dbMovies.run(insert, ["Spiderman", "Jon Watts", 2018]); // typo diperbaiki
//                         dbMovies.run(insert, ["Inside Out", "Pete Docter", 2015]);
//                     }
//                 });
//             }
//         });

        // Buat tabel users
        


// const dbDirectors = new sqlite3.Database(DBSOURCE_2, (err) => {
//     if (err) {
//         console.error("Error:", err.message);
//         throw err;
//     }
//     console.log(`Berhasil terhubung ke database: ${DBSOURCE_2}`);
//     dbDirectors.run(
//         `CREATE TABLE IF NOT EXISTS directors (
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             name TEXT NOT NULL,
//             birthYear INTEGER NOT NULL
//         )`,
//         (err) => {
//             if (!err) {
//                 console.log("Tabel 'directors' berhasil dibuat. Masukan data awal....");
//                 const insert = 'INSERT INTO directors (name, birthYear) VALUES (?,?)';
//                 dbDirectors.run(insert, ["Don Hall", 1980]);
//                 dbDirectors.run(insert, ["Jon Watts", 1985]);
//                 dbDirectors.run(insert, ["Pete Docter", 1990]);
//             } else {
//                 console.log("Tabel 'directors' sudah ada");
//             }
//         }
//     );
// });

// dbDirectors.run(`CREATE TABLE IF NOT EXISTS users (
//             id INTEGER PRIMARY KEY AUTOINCREMENT,
//             username TEXT NOT NULL UNIQUE,
//             password TEXT NOT NULL
//         );`, (err) => {
//             if (err) {
//                 console.error("Gagal membuat tabel users:", err.message);
//             } else {
//                 console.log("Tabel 'users' siap digunakan.");
//             }
//         });

    module.exports = pool;

// module.exports =
//   dbMovies
//     dbDirectors };