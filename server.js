require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db.js'); // Koneksi ke file db.js yang baru
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken, authorizeRole } = require('./middleware/auth.js'); // Pastikan path middleware benar

const app = express();
const PORT = process.env.PORT || 3300;
const JWT_SECRET = process.env.JWT_SECRET;

// === MIDDLEWARE ===
app.use(cors());
app.use(express.json());

// === ROUTES UTAMA ===
app.get('/status', (req, res) => {
  res.json({ ok: true, service: 'film-api-prod', db: 'postgresql' });
});

// ==========================================
// 1. AUTH ROUTES (POSTGRESQL VERSION)
// ==========================================

// Register User
app.post('/auth/register', async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 6) {
    return res.status(400).json({ error: 'Username dan password (min 6 char) harus diisi' });
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Sintaks $1, $2 adalah placeholder untuk Postgres (pengganti ?)
    // RETURNING * berguna untuk mengambil data yang baru saja diinput
    const sql = 'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role';
    const result = await db.query(sql, [username.toLowerCase(), hashedPassword, 'user']);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Kode error unik Postgres untuk data duplikat
      return res.status(409).json({ error: 'Username sudah digunakan' });
    }
    next(err);
  }
});

// Login User
app.post('/auth/login', async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const sql = "SELECT * FROM users WHERE username = $1";
    const result = await db.query(sql, [username.toLowerCase()]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Kredensial tidak valid' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Kredensial tidak valid' });
    }

    const payload = { user: { id: user.id, username: user.username, role: user.role } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    
    res.json({ message: 'Login berhasil', token: token, role: user.role });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 2. MOVIE ROUTES (POSTGRESQL VERSION)
// ==========================================

// GET All Movies
app.get('/movies', async (req, res, next) => {
  const sql = `
    SELECT m.id, m.title, m.year, d.name as director_name 
    FROM movies m 
    LEFT JOIN directors d ON m.director_id = d.id 
    ORDER BY m.id ASC
  `;
  try {
    const result = await db.query(sql);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET Movie by ID
app.get('/movies/:id', async (req, res, next) => {
  const sql = `
    SELECT m.id, m.title, m.year, d.name as director_name 
    FROM movies m 
    LEFT JOIN directors d ON m.director_id = d.id 
    WHERE m.id = $1
  `;
  try {
    const result = await db.query(sql, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Film tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST Movie (Admin Only)
app.post('/movies', authenticateToken, async (req, res, next) => {
  const { title, director_id, year } = req.body;
  if (!title || !director_id || !year) {
    return res.status(400).json({ error: 'title, director_id, year wajib diisi' });
  }
  const sql = 'INSERT INTO movies (title, director_id, year) VALUES ($1, $2, $3) RETURNING *';
  try {
    const result = await db.query(sql, [title, director_id, year]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT Movie (Admin Only)
app.put('/movies/:id', [authenticateToken, authorizeRole('admin')], async (req, res, next) => {
  const { title, director_id, year } = req.body;
  const sql = 'UPDATE movies SET title = $1, director_id = $2, year = $3 WHERE id = $4 RETURNING *';
  try {
    const result = await db.query(sql, [title, director_id, year, req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Film tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE Movie (Admin Only)
app.delete('/movies/:id', [authenticateToken, authorizeRole('admin')], async (req, res, next) => {
  const sql = 'DELETE FROM movies WHERE id = $1 RETURNING *';
  try {
    const result = await db.query(sql, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Film tidak ditemukan' });
    }
    res.json({ message: 'Film berhasil dihapus' });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 3. DIRECTOR ROUTES (TUGAS: COMPLETED)
// ==========================================

// GET All Directors
app.get('/directors', async (req, res, next) => {
    try {
        const result = await db.query('SELECT * FROM directors ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

// GET Director by ID
app.get('/directors/:id', async (req, res, next) => {
    try {
        const sql = 'SELECT * FROM directors WHERE id = $1';
        const result = await db.query(sql, [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Sutradara tidak ditemukan' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

// POST Director (Admin Only)
app.post('/directors', [authenticateToken, authorizeRole('admin')], async (req, res, next) => {
    const { name, birthYear } = req.body;
    if (!name || !birthYear) return res.status(400).json({ error: 'Nama dan birthYear wajib diisi' });

    try {
        const sql = 'INSERT INTO directors (name, "birthYear") VALUES ($1, $2) RETURNING *';
        const result = await db.query(sql, [name, birthYear]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

// PUT Director (Admin Only)
app.put('/directors/:id', [authenticateToken, authorizeRole('admin')], async (req, res, next) => {
    const { name, birthYear } = req.body;
    // Perhatikan tanda kutip dua pada "birthYear" karena kolom di Neon case-sensitive
    const sql = 'UPDATE directors SET name = $1, "birthYear" = $2 WHERE id = $3 RETURNING *';
    try {
        const result = await db.query(sql, [name, birthYear, req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Sutradara tidak ditemukan' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

// DELETE Director (Admin Only)
app.delete('/directors/:id', [authenticateToken, authorizeRole('admin')], async (req, res, next) => {
    const sql = 'DELETE FROM directors WHERE id = $1 RETURNING *';
    try {
        const result = await db.query(sql, [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Sutradara tidak ditemukan' });
        }
        res.json({ message: 'Sutradara berhasil dihapus' });
    } catch (err) {
        // Handle error constraint jika sutradara masih punya film
        if (err.code === '23503') { 
            return res.status(400).json({ error: 'Tidak dapat menghapus sutradara yang masih memiliki film terdaftar' });
        }
        next(err);
    }
});

// === ERROR HANDLING ===
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.stack);
  res.status(500).json({ error: 'Terjadi kesalahan internal server' });
});

// === START SERVER ===
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});