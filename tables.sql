CREATE TABLE "Poke_Ball" (
	"name"	TEXT,
	"description"	TEXT,
	"effectiveness"	INTEGER
);

CREATE TABLE "Potion" (
	"name"	TEXT,
	"description"	TEXT,
	"hp"	INTEGER
);

CREATE TABLE "TM" (
	"name"	TEXT,
	"move"	TEXT,
	"type"	TEXT,
	"description"	TEXT
);

CREATE TABLE "history" (
	"username"	TEXT,
	"item"	TEXT,
	"date"	INTEGER DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE "inventory" (
	"item"	TEXT,
	"id"	INTEGER,
	"amount"	INTEGER,
	"type"	INTEGER,
	"price"	INTEGER,
	"image"	TEXT,
	"rating"	INTEGER
);

CREATE TABLE "reviews" (
	"item"	TEXT,
	"username"	TEXT,
	"feedback"	TEXT,
	"rating"	INTEGER
);

CREATE TABLE "sqlite_sequence" (
	"name"	,
	"seq"
);

CREATE TABLE "users" (
	"id"	INTEGER,
	"username"	VARCHAR(255) NOT NULL,
	"pass"	VARCHAR(255) NOT NULL,
	"sessionid"	VARCHAR(63),
	"email"	TEXT,
	"balance"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT)
);