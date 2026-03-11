CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP,
  location TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
