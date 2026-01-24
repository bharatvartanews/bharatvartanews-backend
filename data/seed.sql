PRAGMA foreign_keys = ON;

/* ================= USERS ================= */
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL, -- SUPER_ADMIN, ADMIN, EDITOR, REPORTER
  avatar TEXT NOT NULL
);

INSERT INTO users VALUES
(1,'Super Admin','admin@bharatvarta.com','SUPER_ADMIN','/avatars/admin.png'),
(2,'Editor Desk','editor@bharatvarta.com','EDITOR','/avatars/editor.png'),
(3,'Reporter Delhi','reporter@bharatvarta.com','REPORTER','/avatars/reporter.png');

/* ================= CATEGORIES ================= */
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  icon TEXT NOT NULL,
  priority INTEGER NOT NULL
);

INSERT INTO categories VALUES
(1,'Top News','top-news','🔥',1),
(2,'National','national','🇮🇳',2),
(3,'Politics','politics','🏛️',3),
(4,'Business','business','💼',4),
(5,'Sports','sports','🏏',5),
(6,'Technology','technology','💻',6);

/* ================= ARTICLES ================= */
CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image TEXT NOT NULL,
  categoryId INTEGER NOT NULL,
  status TEXT NOT NULL, -- DRAFT, REVIEWED, APPROVED, PUBLISHED
  authorId INTEGER NOT NULL,
  reviewedBy INTEGER NOT NULL,
  approvedBy INTEGER NOT NULL,
  publishedAt TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY(categoryId) REFERENCES categories(id)
);

INSERT INTO articles VALUES
(1,
'India launches new digital infrastructure',
'India today launched a new digital public infrastructure aimed at transforming governance and citizen services.',
'/news/news1.jpg',
2,
'PUBLISHED',
3,
2,
1,
'2025-01-10',
'2025-01-09'
),
(2,
'Stock markets hit record high',
'Indian stock markets reached an all-time high today driven by IT and banking stocks.',
'/news/news2.jpg',
4,
'PUBLISHED',
3,
2,
1,
'2025-01-10',
'2025-01-09'
),
(3,
'India wins historic cricket series',
'Team India clinched a historic series win with a dominant performance.',
'/news/news3.jpg',
5,
'PUBLISHED',
3,
2,
1,
'2025-01-10',
'2025-01-09'
);

/* ================= VIDEOS ================= */
CREATE TABLE IF NOT EXISTS videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  videoUrl TEXT NOT NULL,
  categoryId INTEGER NOT NULL,
  publishedAt TEXT NOT NULL
);

INSERT INTO videos VALUES
(1,
'Daily News Bulletin',
'/videos/thumb1.jpg',
'https://www.w3schools.com/html/mov_bbb.mp4',
1,
'2025-01-10'
),
(2,
'Market Analysis',
'/videos/thumb2.jpg',
'https://www.w3schools.com/html/movie.mp4',
4,
'2025-01-10'
);

/* ================= STORIES ================= */
CREATE TABLE IF NOT EXISTS stories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  image TEXT NOT NULL,
  publishedAt TEXT NOT NULL
);

INSERT INTO stories VALUES
(1,'Top Headlines Today','/stories/story1.jpg','2025-01-10'),
(2,'Election Update','/stories/story2.jpg','2025-01-10');

/* ================= LIVE ================= */
CREATE TABLE IF NOT EXISTS live_news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  isActive INTEGER NOT NULL
);

INSERT INTO live_news VALUES
(1,'Breaking: Parliament Session Live','Live coverage from Parliament',1);

/* ================= ANALYTICS ================= */
CREATE TABLE IF NOT EXISTS analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entityType TEXT NOT NULL, -- article, video
  entityId INTEGER NOT NULL,
  views INTEGER NOT NULL,
  shares INTEGER NOT NULL,
  likes INTEGER NOT NULL
);

INSERT INTO analytics VALUES
(1,'article',1,12450,320,890),
(2,'article',2,9800,210,650),
(3,'article',3,15000,540,1200),
(4,'video',1,8600,190,430);

/* ================= FEATURE FLAGS ================= */
CREATE TABLE IF NOT EXISTS feature_flags (
  name TEXT PRIMARY KEY,
  enabled INTEGER NOT NULL
);

INSERT INTO feature_flags VALUES
('ads',0),
('comments',0),
('subscriptions',0),
('push_notifications',0);
