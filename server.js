
require('dotenv').config();
// const cors = require('cors');
const express = require('express');
const pool = require('./database.js');
// const {dbDirectors} = require('./database.js');
const app = express();
const port = process.env.PORT || 3300;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const authenticateToken = require('./Middleware/authMiddleware.js');
app.use(cors());
// const port = 3100;

//middleware data
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Selamat datang di Rest API!');
});

let directors = [
    { id: 1, name: "Don Hall", birthYear: 1980},
    { id: 2, name: "Jon Watts", birthYear: 1985},
    { id: 3, name: "Pete Docter", birthYear: 1990},

];

// let movies = [
//   { id: 1, title: "Moana", director: "Don Hall", year: 2016 },
//   { id: 2, title: "Spiderman", director: "Jon Watts", year: 2018 },
//   { id: 3, title: "Inside Out", director: "Pete Docter", year: 2015 }
// ];

    app.get('/status', (req, res) => {
        res.json({
            status: 'OK',
            message: 'Server is running',
            timestamp: new Date()
        });
    }
);

app.get('/directors',async, (req, res) => {
    const sql = "SELECT * FROM directors ORDER BY id ASC";
    dbDirectors.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({"error": err.message});
        }
        res.json(rows);
    });
});

app.get('/directors/:id',async, (req, res) => {
    const sql = "SELECT * FROM directors WHERE id = ?";
    const id = Number(req.params.id);

    dbDirectors.get(sql, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ error: 'Film tidak ditemukan' });
        }
    });
});


app.post('/directors',authenticateToken, async (req, res) => {
    const { name, birthYear } = req.body;
    if (!name || !birthYear) {
        return res.status(400).json({ error: `name, birthYear is required`});
    }
    const sql =  'INSERT INTO directors (name, birthYear) VALUES (?,?)';
    dbDirectors.run(sql, [name, birthYear], function(err) {
        if (err) {
            return res.status(500).json({error: err.message});
        }
        res.status(201).json({id: this.lastID, name, birthYear});
    });
});

app.put('/directors/:id',authenticateToken, async (req, res) => {
    const { name, birthYear } = req.body;
    const id = Number(req.params.id);

    if (!name || !birthYear) {
        return res.status(400).json({ error: 'name and birthYear are required' });
    }

    const sql = 'UPDATE directors SET name = ?, birthYear = ? WHERE id = ?';
    dbDirectors.run(sql, [name, birthYear, id], function(err) { 
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "directors tidak ditemukan" });
        }
        res.json({ id, name, birthYear });
    });
});

app.delete('/directors/:id',authenticateToken,async (req, res) => {
    const sql = 'DELETE FROM directors WHERE id = ?';
    const id = Number(req.params.id);

    dbDirectors.run(sql, id, function(err) {
        if (err) {
            return res.status(500).json({error: err.message});
        }
        if (this.changes === 0) {
            return res.status(400).json({error: "Directors tidak ditemukan"});
        }
        res.status(204).send();
    });
});



    app.get('/', (req,res) => {
   res.send('Selamat Datang diserver Node.js')
    });

    app.get('/status', (req, res) => {
        res.json({
            status: 'OK',
            message: 'Server is running',
            timestamp: new Date()
        });
    }
);

app.get('/movies',async, (req, res) => {
    const sql = "SELECT * FROM movies ORDER BY id ASC";
    dbMovies.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({"error": err.message});
        }
        res.json(rows);
    });
});

app.get('/movies/:id',async, (req, res) => {
    const sql = "SELECT * FROM movies WHERE id = ?";
    const id = Number(req.params.id);

    dbMovies.get(sql, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ error: 'Film tidak ditemukan' });
        }
    });
});

app.post('/movies',authenticateToken,async, (req, res) => {
    const { title, director, year } = req.body;
    if (!title || !director || !year) {
        return res.status(400).json({ error: 'title, director, dan year wajib diisi' });
    }

    const sql = 'INSERT INTO movies (title, director, year) VALUES (?,?,?)';
    dbMovies.run(sql, [title, director, year], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, title, director, year });
    });
});

app.put('/movies/:id', authenticateToken,async (req, res) => {
  const { title, director, year } = req.body;
  const { id } = req.params;

  if (!title || !director || !year) {
    return res.status(400).json({ error: 'Semua field wajib diisi' });
  }

  const sql = 'UPDATE movies SET title = ?, director = ?, year = ? WHERE id = ?';
  dbMovies.run(sql, [title, director, year, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ updatedID: id, title, director, year });
  });
});


app.delete('/movies/:id',authenticateToken,async (req, res) => {
    const sql = 'DELETE FROM movies WHERE id = ?';
    const id = Number(req.params.id);

    dbMovies.run(sql, id, function(err) {
        if (err) {
            return res.status(500).json({error: err.message});
        }
        if (this.changes === 0) {
            return res.status(400).json({error: "Film tidak ditemukan"});
        }
        res.status(204).send();
    });
});

app.post('/auth/register',async (req, res) => {
    const { username, password} = req.body;
    if (!username || !password || password.length < 6) {
        return res.status(400).json({ error: 'Username dan password (min 6 char) harus diisi'});
    }

bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
        console.error("Error hashing: ", err);
        return res.status(500).json({ error: 'Gagal memproses pendaftaran'});
    }

const sql = `INSERT INTO users (username, password) VALUES
(?, ?)`;
const params = [username.toLowerCase(), hashedPassword];
dbMovies.run(sql, params, function(err) {
    if (err) {
        if (err.message.includes('UNIQUE constraint')) {
            return res.status(409).json({ error: 'Username sudah digunakan'});
        }
        console.error("Error inserting user:", err);
        return res.status(500).json({ error: 'Gagal menyimpan pengguna'});
    }
    res.status(201).json({ message: 'Registrasi berhasil', userId: this.lastID});
});
});
});

// dbDirectors.run(sql, params, function(err) {
//     if (err) {
//         if (err.message.includes('UNIQUE constraint')) {
//             return res.status(409).json({ error: 'Username sudah digunakan'});
//         }
//         console.error("Error inserting user:", err);
//         return res.status(500).json({ error: 'Gagal menyimpan pengguna'});
//     }
//     res.status(201).json({ message: 'Registrasi berhasil', userId: this.lastID});
// });
// });
// });

app.post('/auth/login',async (req, res) => {
    const {username, password} = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username dan password harus diisi'});
    }
    const sql = "select * from users where username = ?";
    dbMovies.get(sql, [username.toLowerCase()], (err, user) => {
        if (err || !user) {
            return res.status(401).json({error: 'kredensial tidak valid'});
        }
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(401).json({error: 'Kredensial tidak valid'});
            }

            const payload = { user: {id: user.id, username: user.username}};
            
            jwt.sign(payload, JWT_SECRET, {expiresIn: '1h'}, (err, token) => {
                if (err) {
                    console.error("Error signing token:", err);
                    return res.status(500).json({ error: 'Gagal membuat token'});
                }
                res.json({ message: 'Login Berhasil', token: token});
            });
        });
    });
});

app.get('/profile', authenticateToken, (req,res) => {
    res.json({
        message: 'Token Valid', user: req.user.user
    });
});

// dbDirectors.get(sql, [username.toLowerCase()], (err, user) => {
//         if (err || !user) {
//             return res.status(401).json({error: 'kredensial tidak valid'});
//         }
//         bcrypt.compare(password, user.password, (err, isMatch) => {
//             if (err || !isMatch) {
//                 return res.status(401).json({error: 'Kredensial tidak valid'});
//             }

//             const payload = { user: {id: user.id, username: user.username}};
             
//             jwt.sign(payload, JWT_SECRET, {expiresIn: '1h'}, (err, token) => {
//                 if (err) {
//                     console.error("Error signing token:", err);
//                     return res.status(500).json({ error: 'Gagal membuat token'});
//                 }
//                 res.json({ message: 'Login Berhasil', token: token});
//             });
//         });
//     });
// });




//    app.get('/directors', (req, res) => {
//     res.json(directors);
//  });


//  app.get('/directors/:id', (req, res) => {
//      const director = directors.find(d => d.id === parseInt(req.params.id));
//      if (director) {
//          res.json(director);
//      } else {
//          res.status(404).send('Director not found');
//      }
//  });

//  app.post('/directors', (req, res) => {
//      const {name, birthYear} = req.body || {};
//      if (!name || !birthYear) {
//          return res.status(400).json({error: 'name, birthYear wajib diisi'});
//      }
//      const newDirectors = {id: directors.length +1, name, birthYear};
//      directors.push(newDirectors);
//      res.status(201).json(newDirectors);
// });

// app.put('/directors/:id', (req, res) => {
//      const id = Number(req.params.id);
//      const directorIndex = directors.findIndex(d => d.id === id);
//      if (directorIndex === -1) {
//          return res.status(404).json({error: 'Director tidak ditemukan'});
//      }
//      const{name, birthYear} = req.body || {};
//      const updatedDirector = {id, name, birthYear};
//      directors[directorIndex] = updatedDirector;
//      res.json(updatedDirector);
// });

// app.delete('/directors/:id', (req, res) => {
//      const id = Number(req.params.id);
//      const directorIndex = directors.findIndex(d =>  d.id === id);
//      if (directorIndex === -1) {
//          return res.status(404).json({error: 'Directors tidak ditemukan'});
//      }
//      directors.splice(directorIndex, 1);
//      res.status(204).send();
//  });

//  app.use((req, res) => {
//     res.status(404).json({error: "Route not found"});
// });

// app.listen(port, () => {
//      console.log(`Server Running on localhost: ${port}`);
//  });



// //dummy data



// app.get('/', (req,res) => {
//     res.send('Selamat Datang diserver Node.js')

// });

// app.get('/movies', (req, res) => {
//     res.json(movies);
// });

// app.get('/movies/:id', (req, res) => {
//     const movie = movies.find(m => m.id === parseInt(req.params.id));
//     if (movie) {
//         res.json(movie);
//     } else {
//         res.status(404).send('Movie not found');
//     }
// });

// app.post('/movies', (req, res) => {
//     const {title, director, year} = req.body || {};
//     if (!title || !director || !year) {
//         return res.status(400).json({error: 'title, director, year wajib diisi'});
//     }
//     const newMovie = {id: movies.length +1, title, director, year};
//     movies.push(newMovie);
//     res.status(201).json(newMovie);
// });

// app.put('/movies/:id', (req, res) => {
//     const id = Number(req.params.id);
//     const movieIndex = movies.findIndex(m => m.id === id);
//     if (movieIndex === -1) {
//         return res.status(404).json({error: 'Movie tidak ditemukan'});
//     }
//     const{title, director, year} = req.body || {};
//     const updatedMovie = {id, title, director, year};
//     movies[movieIndex] = updatedMovie;
//     res.json(updatedMovie);
// });

// app.delete('/movies/:id', (req, res) => {
//     const id = Number(req.params.id);
//     const movieIndex = movies.findIndex(m =>  m.id === id);
//     if (movieIndex === -1) {
//         return res.status(404).json({error: 'Movie tidak ditemukan'});
//     }
//     movies.splice(movieIndex, 1);
//     res.status(204).send();
// })

module.exports = app;

// app.listen(port, () => {
//     console.log(`Server Running on ${port}`);
// });