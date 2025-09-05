import express from 'express';
import cors from 'cors';
import { db, initSchema } from './db';

const app = express();
app.use(cors());
app.use(express.json());

initSchema();

// Stats
app.get('/api/stats', (_req, res) => {
  const students = db.prepare('SELECT COUNT(*) as count FROM students').get().count as number;
  const teachers = db.prepare('SELECT COUNT(*) as count FROM teachers').get().count as number;
  const classes = db.prepare('SELECT COUNT(*) as count FROM classes').get().count as number;
  res.json({ students, teachers, classes });
});

// Students CRUD
app.get('/api/students', (_req, res) => {
  const rows = db.prepare('SELECT * FROM students').all();
  res.json(rows);
});

app.post('/api/students', (req, res) => {
  const { first_name, last_name, class_id } = req.body ?? {};
  const stmt = db.prepare('INSERT INTO students (first_name, last_name, class_id) VALUES (?, ?, ?)');
  const info = stmt.run(first_name, last_name, class_id ?? null);
  res.json({ id: info.lastInsertRowid });
});

app.put('/api/students/:id', (req, res) => {
  const id = Number(req.params.id);
  const { first_name, last_name, class_id } = req.body ?? {};
  const stmt = db.prepare('UPDATE students SET first_name=?, last_name=?, class_id=? WHERE id=?');
  stmt.run(first_name, last_name, class_id ?? null, id);
  res.json({ ok: true });
});

app.delete('/api/students/:id', (req, res) => {
  const id = Number(req.params.id);
  db.prepare('DELETE FROM students WHERE id=?').run(id);
  res.json({ ok: true });
});

// Student attendance
app.post('/api/attendance', (req, res) => {
  const { student_id, date, status } = req.body ?? {};
  const stmt = db.prepare('INSERT OR REPLACE INTO attendance (student_id, date, status) VALUES (?, ?, ?)');
  stmt.run(student_id, date, status);
  res.json({ ok: true });
});

app.get('/api/attendance/:studentId', (req, res) => {
  const studentId = Number(req.params.studentId);
  const rows = db.prepare('SELECT * FROM attendance WHERE student_id=? ORDER BY date DESC').all(studentId);
  res.json(rows);
});

// Teachers CRUD
app.get('/api/teachers', (_req, res) => {
  const rows = db.prepare('SELECT * FROM teachers').all();
  res.json(rows);
});

app.post('/api/teachers', (req, res) => {
  const { first_name, last_name, subject } = req.body ?? {};
  const info = db.prepare('INSERT INTO teachers (first_name, last_name, subject) VALUES (?, ?, ?)').run(first_name, last_name, subject ?? null);
  res.json({ id: info.lastInsertRowid });
});

app.put('/api/teachers/:id', (req, res) => {
  const id = Number(req.params.id);
  const { first_name, last_name, subject } = req.body ?? {};
  db.prepare('UPDATE teachers SET first_name=?, last_name=?, subject=? WHERE id=?').run(first_name, last_name, subject ?? null, id);
  res.json({ ok: true });
});

app.delete('/api/teachers/:id', (req, res) => {
  const id = Number(req.params.id);
  db.prepare('DELETE FROM teachers WHERE id=?').run(id);
  res.json({ ok: true });
});

// Teacher attendance and salaries
app.post('/api/teacher-attendance', (req, res) => {
  const { teacher_id, date, status } = req.body ?? {};
  db.prepare('INSERT OR REPLACE INTO teacher_attendance (teacher_id, date, status) VALUES (?, ?, ?)')
    .run(teacher_id, date, status);
  res.json({ ok: true });
});

app.post('/api/salaries', (req, res) => {
  const { teacher_id, month, amount, paid } = req.body ?? {};
  db.prepare('INSERT OR REPLACE INTO salaries (teacher_id, month, amount, paid) VALUES (?, ?, ?, ?)')
    .run(teacher_id, month, amount, paid ? 1 : 0);
  res.json({ ok: true });
});

app.get('/api/salaries/:teacherId', (req, res) => {
  const teacherId = Number(req.params.teacherId);
  const rows = db.prepare('SELECT * FROM salaries WHERE teacher_id=? ORDER BY month DESC').all(teacherId);
  res.json(rows);
});

// Classes CRUD and linking
app.get('/api/classes', (_req, res) => {
  const rows = db.prepare('SELECT * FROM classes').all();
  res.json(rows);
});

app.post('/api/classes', (req, res) => {
  const { name, teacher_id } = req.body ?? {};
  const info = db.prepare('INSERT INTO classes (name, teacher_id) VALUES (?, ?)').run(name, teacher_id ?? null);
  res.json({ id: info.lastInsertRowid });
});

app.put('/api/classes/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, teacher_id } = req.body ?? {};
  db.prepare('UPDATE classes SET name=?, teacher_id=? WHERE id=?').run(name, teacher_id ?? null, id);
  res.json({ ok: true });
});

app.delete('/api/classes/:id', (req, res) => {
  const id = Number(req.params.id);
  db.prepare('DELETE FROM classes WHERE id=?').run(id);
  res.json({ ok: true });
});

// Grades
app.get('/api/grades/:studentId', (req, res) => {
  const studentId = Number(req.params.studentId);
  const rows = db.prepare('SELECT * FROM grades WHERE student_id=? ORDER BY term DESC').all(studentId);
  res.json(rows);
});

app.post('/api/grades', (req, res) => {
  const { student_id, subject, score, term } = req.body ?? {};
  const info = db.prepare('INSERT INTO grades (student_id, subject, score, term) VALUES (?, ?, ?, ?)')
    .run(student_id, subject, score, term);
  res.json({ id: info.lastInsertRowid });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


