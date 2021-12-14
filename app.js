/**
 * backend of application that sens get/post requests.
 */
'use strict';

const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const express = require('express');
const app = express();
const multer = require("multer");
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

const INVALID_PARAM_ERROR = 400;
const INVALID_PARAM_ERROR_MESSAGE = 'Missing one or more of the required params.';
const SERVER_ERROR = 500;
const SERVER_ERROR_MSG = 'An error occurred on the server. Try again later.';
const LOCAL_PORT = 8000;
const COOKIE_EXPIRATION = 10800000;
const INITIAL_BALANCE = 1000;
const REVIEW_MIN = 5;
const RAN_VALUES = 36;
const SUB_MAX = 15;
const SUB_MIN = 2;
const MULTIPLIER = 100;

app.get('/pokemart/inventory', async function(req, res) {
  try {
    let search = req.query.search;
    let sql;
    if (search) {
      sql = 'SELECT * FROM inventory WHERE item LIKE "%' + search + '%" ORDER BY id';
    } else {
      sql = 'SELECT * FROM inventory ORDER BY id';
    }
    let db = await getDBConnection();
    let result = await db.all(sql);
    await db.close();
    res.json(result);
  } catch (err) {
    res.type('text');
    res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
  }
});

app.get('/pokemart/item', async function(req, res) {
  try {
    let id = req.query.id;
    if (id) {
      let db = await getDBConnection();
      let result = await db.all('SELECT item, type FROM inventory WHERE id =?', id);
      let sql = 'SELECT * FROM inventory JOIN ' +
      result[0].type + ' r ON inventory.item = r.name WHERE id =?';
      result = await db.all(sql, id);
      await db.close();
      res.type('text');
      res.json(result);
    } else {
      res.type('text');
      res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
    }
  } catch (err) {
    res.type('text');
    res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
  }
});

app.post('/pokemart/login', async function(req, res) {
  res.type('text');
  let user = req.body.username;
  let pass = req.body.password;
  let email = req.body.email;
  if (!user || !pass || !email) {
    res.status(INVALID_PARAM_ERROR).send(INVALID_PARAM_ERROR_MESSAGE);
  } else {
    try {
      let sql = 'SELECT * FROM users WHERE username = ? AND pass = ? AND email = ?;';
      let db = await getDBConnection();
      let results = await db.all(sql, [user, pass, email]);
      if (results.length === 0) {
        res.send("account does not exist");
      } else {
        let id = await getSessionId();
        await db.run('UPDATE users SET sessionid = ? WHERE username = ?', [id, user]);
        res.cookie('sessionid', id, {expires: new Date(Date.now() + COOKIE_EXPIRATION)});
        res.send(id);
      }
      await db.close();
    } catch (err) {
      res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
    }
  }
});

app.post('/pokemart/register', async function(req, res) {
  res.type('text');
  let user = req.body.username;
  let pass = req.body.password;
  let email = req.body.email;
  if (!user || !pass || !email) {
    res.status(INVALID_PARAM_ERROR).send(INVALID_PARAM_ERROR_MESSAGE);
  } else {
    try {
      let sql = 'SELECT * FROM users WHERE username = ? OR email = ?;';
      let db = await getDBConnection();
      let results = await db.all(sql, [user, email]);
      if (results.length === 0) {
        let id = await getSessionId();
        sql =
        'INSERT INTO users (username, pass, email, balance, sessionid) VALUES (?, ?, ?, ?, ?)';
        await db.run(sql, [user, pass, email, INITIAL_BALANCE, id]);
        res.cookie('sessionid', id, {expires: new Date(Date.now() + COOKIE_EXPIRATION)});
        res.send(id);
      } else {
        res.send("that username or email is already in use");
      }
      await db.close();
    } catch (err) {
      res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
    }
  }
});

app.post('/pokemart/history', async function(req, res) {
  let username = req.body.username;
  if (!username) {
    res.status(INVALID_PARAM_ERROR).send(INVALID_PARAM_ERROR_MESSAGE);
  } else {
    try {
      let db = await getDBConnection();
      let sql = 'SELECT * FROM history WHERE username=? ORDER BY date DESC';
      let result = await db.all(sql, [username]);
      await db.close();
      res.json(result);
    } catch (err) {
      res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
    }
  }
});

app.get('/pokemart/userdata', async function(req, res) {
  let session = req.cookies['sessionid'];
  let query = 'SELECT username, balance FROM users WHERE sessionid = ?';
  let db = await getDBConnection();
  let result = await db.all(query, session);
  res.json(result);
});

app.post('/pokemart/purchase', async (req, res) => {
  try {
    let user = req.body.user;
    let cost = req.body.cost;
    let itemName = req.body.item;
    let itemAmount = req.body.itemamount;
    if (user && cost && itemName && itemAmount) {
      let db = await getDBConnection();
      let result = await db.all('SELECT balance FROM users WHERE username =?', user);
      if (result.length === 0) {
        res.status(INVALID_PARAM_ERROR).send("Yikes. User does not exist.");
      } else {
        let balance = parseInt(result[0]['balance']);
        balance = balance - cost;
        await db.run('UPDATE users SET balance =? WHERE username =?', balance, user);
        await db.run('UPDATE inventory SET amount =? WHERE item =?', itemAmount - 1, itemName);
        await db.run('INSERT INTO history (username, item) VALUES (?, ?)', user, itemName);
        res.type('text');
        res.send(String(balance));
      }
      await db.close();
    } else {
      res.status(INVALID_PARAM_ERROR).send(INVALID_PARAM_ERROR_MESSAGE);
    }
  } catch (err) {
    res.type('text');
    res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
  }
});

app.post('/pokemart/review', async function(req, res) {
  res.type('text');
  let user = req.body.username;
  let item = req.body.item;
  let rating = req.body.rating;
  let feedback = req.body.feedback;
  if (rating > REVIEW_MIN) {
    res.status(INVALID_PARAM_ERROR).send("please use a valid number less than or equal to 5");
  }
  if (!user || !item || !rating) {
    res.status(INVALID_PARAM_ERROR).send(INVALID_PARAM_ERROR_MESSAGE);
  } else {
    try {
      let db = await getDBConnection();
      let results =
      await db.all('SELECT * FROM reviews WHERE username = ? AND item =?', [user, item]);
      if (results.length === 0) {
        await insertOrUpdateReview(user, item, rating, feedback);
        let newAverageRating = await calculateAverageRating(item);
        await db.run('UPDATE inventory SET rating =? WHERE item =?', newAverageRating, item);
        res.send("successfully submitted rating!");
      } else {
        res.send("you have already reviewed this item!");
      }
      await db.close();
    } catch (err) {
      res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
    }
  }
});

/**
 * Generates an unused sessionid and returns it to the user.
 * @returns {string} - The random session id.
 */
async function getSessionId() {
  let query = 'SELECT sessionid FROM users WHERE sessionid = ?';
  let id;
  let db = await getDBConnection();
  do {
    // This wizardry comes from https://gist.github.com/6174/6062387
    id = Math.random().toString(RAN_VALUES)
      .substring(SUB_MIN, SUB_MAX) + Math.random().toString(RAN_VALUES)
      .substring(SUB_MIN, SUB_MAX);
  } while (((await db.all(query, id)).length) > 0);
  await db.close();
  return id;
}

/**
 * Calculates the new average rating of an item
 * @param {string} item - The item being rated
 * @returns {string} - The new rating.
 */
async function calculateAverageRating(item) {
  let query = 'SELECT rating FROM reviews WHERE item = ?';
  let db = await getDBConnection();
  let result = await db.all(query, item);
  let totalReviews = result.length;
  let totalRating = 0;
  for (let i = 0; i < totalReviews; i++) {
    totalRating += result[i].rating;
  }
  await db.close();
  return String(Math.round(totalRating / totalReviews * MULTIPLIER) / MULTIPLIER);
}

/**
 * Calculates the new average rating of an item
 * @param {string} user - the user leaving the review
 * @param {string} item - The item being rated
 * @param {string} rating - the rating for the item
 * @param {string} feedback - an explanation for the rating
 */
async function insertOrUpdateReview(user, item, rating, feedback) {
  let sql =
  'INSERT INTO reviews (username, item, rating, feedback) VALUES (?, ?, ?, ?)';
  let db = await getDBConnection();
  await db.run(sql, [user, item, rating, feedback]);
  await db.close();
}

/**
 * Establishes a database connection to a database and returns the database object.
 * Any errors that occur during connection should be caught in the function
 * that calls this one.
 * @returns {Object} - The database object for the connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'pokemart.db',
    driver: sqlite3.Database
  });
  return db;
}

app.use(express.static('public'));
const PORT = process.env.PORT || LOCAL_PORT;
app.listen(PORT);