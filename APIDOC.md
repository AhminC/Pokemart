# Pokemart API Documentation
The Pokemon Guesser Recorder API records the score and logs the guesses for the player of the Pokemon Guesser

## *Get inventory*
**Request Format:** /pokemart/inventory

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** It will all inventory data based off the search query.  Otherwise it will return the entire inventory

**Example Request:** /pokemart/inventory?search=poke

**Example Response:**
```json
[
  {
    "item": "Poke Ball",
    "id": 0,
    "amount": 993,
    "type": "Poke_Ball",
    "price": 200,
    "image": "ball_regular.png"
  }
]
```

## *Get unique item data*
**Request Format:** /pokemart/item

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** It will all unique data for an item depending on what category it belongs to.

**Example Request:** /pokemart/item?id=15

**Example Response:**
```json
[
  {
    "item": "TM01",
    "id": 15,
    "amount": 999,
    "type": "normal",
    "price": 3000,
    "image": "tm_normal.png",
    "name": "TM01",
    "move": "Mega Punch",
    "description": "This TM will teach your Pokemon the move \"Mega Punch\""
  }
]
```

**Error Handling:**
- Possible 500 (internal error) errors (all plain text):
  - If the server is down, responds with: 'An error occurred on the server. Try again later.

## *Login*
**Request Format:** /pokemart/login

**Request Type:** POST

**Returned Data Format**: Plain Text

**Description:** Responds with the randomly generated session id cookie if the account exists given name, email, and password.  Updates session id in user table

**Example Request:** /pokemart/login

**Example Response:**
```
xy63htsw7dl8x91vewdbb
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If the user does not provide a name, email, or password, returns an error with the message: "Missing one or more required parameters"
- Possible 500 (internal error) errors (all plain text):
  - If the server is down, responds with: "something went wrong on the server"
- If the credentials don't match, reponds with text "account does not exist"


## *Register*
**Request Format:** /pokemart/register

**Request Type:** POST

**Returned Data Format**: Plain Text

**Description:** Responds with the randomly generated session id cookie if the account does not exist given name & email. Adds the account to the user table

**Example Request:** /pokemart/register

**Example Response:**
```
xy63htsw7dl8x91vewdbb
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If the user does not provide a name, email, or password, returns an error with the message: "Missing one or more required parameters"
- Possible 500 (internal error) errors (all plain text):
  - If the server is down, responds with: "something went wrong on the server"
- If the credentials match a user already in the system, reponds with text "that username or email is already in use"

## *Get user data*
**Request Format:** /pokemart/userdata

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Returns the user's balance and username given session id cookie

**Example Request:** /pokemart/userdata

**Example Response:**
```json
[
  {
    "username": "red",
    "balance": 13303749
  }
]
```

## *Purchase item*
**Request Format:** /pokemart/purchase

**Request Type:** POST

**Returned Data Format**: Plain Text

**Description:** Responds with the user's new balance given their name, the item, and it's cost.  Updates the user's balance and the remaining items left after the transaction in the database.
**Example Request:** /pokemart/purchase

**Example Response:**
```
13303549
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If the user does not provide a name, cost, item id, or item amount, returns an error with the message: "Missing one or more required parameters"
- Possible 500 (internal error) errors (all plain text):
  - If the server is down, responds with: "something went wrong on the server"

## *Get unique username*
**Request Format:** /pokemart/history

**Request Type:** POST

**Returned Data Format**: Plain Text

**Description:** Respond with data of username and date.

**Example Request:** /pokemart/history

**Example Response:**
```json
[
  {
    "username": "red",
    "item": "Potion",
    "date": "2021-12-11 17:24:44",
  }
]
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If the user does not provide a name, cost, item id, or item amount, returns an error with the message: "Missing one or more required parameters"
- Possible 500 (internal error) errors (all plain text):
  - If the server is down, responds with: "something went wrong on the server"

## *Get userdata*
**Request Format:** /pokemart/userdata

**Request Type:** GET

**Returned Data Format**: Plain Text

**Description:** Respond with data of username and sessionid.

**Example Request:** /pokemart/userdata

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If the user does not provide a name, cost, item id, or item amount, returns an error with the message: "Missing one or more required parameters"
- Possible 500 (internal error) errors (all plain text):
  - If the server is down, responds with: "something went wrong on the server"

## *Get purchases*
**Request Format:** /pokemart/purchase

**Request Type:** POST

**Returned Data Format**: Plain Text

**Description:** Returns information of what item was bought by user.

**Example Request:** /pokemart/purchase

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If the user does not provide a name, cost, item id, or item amount, returns an error with the message: "Missing one or more required parameters"
- Possible 500 (internal error) errors (all plain text):
  - If the server is down, responds with: "something went wrong on the server"

## *Get review*
**Request Format:** /pokemart/review

**Request Type:** POST

**Returned Data Format**: Plain Text

**Description:** Gives reviews of items that were bought.

**Example Request:** /pokemart/review/Master_Ball

**Example Response:**
```json
[
  {
    "item": "TM01",
    "review": "very good item"
  }
]
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If the user does not provide a name, cost, item id, or item amount, returns an error with the message: "Missing one or more required parameters"
- Possible 500 (internal error) errors (all plain text):
  - If the server is down, responds with: "something went wrong on the server"