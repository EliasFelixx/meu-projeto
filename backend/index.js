const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cadastro',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios ORDER BY criado_em DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.post('/usuarios', async (req, res) => {
  const { nome, email, telefone } = req.body;
  if (!nome || !email) return res.status(400).json({ erro: 'Nome e e-mail sao obrigatorios.' });
  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, telefone) VALUES ($1, $2, $3) RETURNING *',
      [nome, email, telefone]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') res.status(409).json({ erro: 'E-mail ja cadastrado.' });
    else res.status(500).json({ erro: err.message });
  }
});

app.delete('/usuarios/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM usuarios WHERE id = $1', [req.params.id]);
    res.json({ mensagem: 'Usuario removido.' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Backend rodando!'));
