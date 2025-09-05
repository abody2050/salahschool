import Database from 'better-sqlite3';

export const db = new Database('school.db');

db.pragma('journal_mode = WAL');

export function initSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      class_id INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (class_id) REFERENCES classes(id)
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      subject TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      teacher_id INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('present','absent','late')),
      FOREIGN KEY (student_id) REFERENCES students(id),
      UNIQUE(student_id, date)
    );

    CREATE TABLE IF NOT EXISTS teacher_attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('present','absent','late')),
      FOREIGN KEY (teacher_id) REFERENCES teachers(id),
      UNIQUE(teacher_id, date)
    );

    CREATE TABLE IF NOT EXISTS salaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL,
      month TEXT NOT NULL,
      amount REAL NOT NULL,
      paid INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id),
      UNIQUE(teacher_id, month)
    );

    CREATE TABLE IF NOT EXISTS grades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      score REAL NOT NULL,
      term TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(id)
    );
  `);
}


