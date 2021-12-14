"use strict";
(function() {
  const BASE_URL = "/pokemart/";
  const INVENTORY_URL = "inventory";
  const ITEM_URL = "item";
  window.addEventListener("load", init);
  let currentItemCost;
  let currentItemAmount;
  let currentItemImage;
  let currentUser;
  let currentUserBalance;
  let currentItemDesciption;
  let currentItemName;
  let currentItemRating;

  /**
   * initializes the home page
   */
  function init() {
    fetchPokemartInventory();
    fetchUserData();
    let searchItem = id("search-bar");
    searchItem.addEventListener('input', enableSearch);
    id("search").addEventListener('click', function() {
      searchInventory(id("search-bar").value);
    }, false);
    id("pokeballs").addEventListener('click', function() {
      searchInventory("ball");
    }, false);
    id("potions").addEventListener('click', function() {
      searchInventory("potion");
    }, false);
    id("tms").addEventListener('click', function() {
      searchInventory("tm");
    }, false);
    id("all").addEventListener('click', function() {
      searchInventory(" ");
    }, false);
    id('account').addEventListener('click', changeToLogin);
    id('history').addEventListener('click', changeToHistory);
    id("item-purchase").addEventListener('click', purchaseItem);
    id('view-grid').addEventListener('click', toggleViews);
  }

  /**
   * switches to history page
   */
  function changeToHistory() {
    window.location.href = 'account.html';
  }

  /**
   * switches to login page
   */
  function changeToLogin() {
    window.location.href = 'login.html';
  }

  /**
   * enables the search button
   * @param {element} element - element
   */
  function enableSearch(element) {
    if (element.target.value !== '') {
      id("search").removeAttribute("disabled", "");
    } else {
      id("search").setAttribute("disabled", "");
    }
  }

  /**
   * allows user to filter items
   * @param {element} searchTerm - element
   */
  function searchInventory(searchTerm) {
    fetch(BASE_URL + INVENTORY_URL + "/?search=" + searchTerm)
      .then(statusCheck)
      .then(res => res.json())
      .then(processPokemartItems)
      .catch(catchError);
  }

  /**
   * gets all items from pokemart database
   */
  function fetchPokemartInventory() {
    fetch(BASE_URL + INVENTORY_URL)
      .then(statusCheck)
      .then(res => res.json())
      .then(processPokemartItems)
      .catch(catchError);
  }

  /**
   * uses response from pokemart database to populate shop
   * @param {element} result - database response
   */
  function processPokemartItems(result) {
    generateListView(result);
    generateGridView(result);
  }

  /**
   * uses response from pokemart database to populate shop to a grid
   * @param {element} result - database response
   */
  function generateGridView(result) {
    let parent = qs("#store-items-grid");
    parent.innerHTML = '';
    for (let i = 0; i < result.length; i++) {
      let newItem = gen('section');
      newItem.id = result[i].id;

      let image = gen('img');
      image.src = '/img/' + result[i].image;

      let name = gen('p');
      name.textContent = result[i].item;

      let amount = gen('p');
      amount.textContent = "₽" + result[i].price;

      newItem.appendChild(image);
      newItem.appendChild(name);
      newItem.appendChild(amount);
      parent.appendChild(newItem);
      newItem.addEventListener('click', fetchItemData);
    }
  }

  /**
   * uses response from pokemart database to populate shop to a list
   * @param {element} result - database response
   */
  function generateListView(result) {
    let parent = qs("#store-items-list");
    parent.innerHTML = '';
    for (let i = 0; i < result.length; i++) {
      let newItem = gen("button");
      newItem.id = result[i].id;
      newItem.classList.add("item");
      let newItemName = gen("p");
      newItemName.textContent = result[i].item;
      newItemName.classList.add("item_name");
      newItem.appendChild(newItemName);
      let newItemPrice = gen("p");
      newItemPrice.textContent = "₽" + result[i].price;
      newItemPrice.classList.add("item_price");
      newItem.appendChild(newItemPrice);
      parent.appendChild(newItem);
      newItem.addEventListener('click', fetchItemData);
    }
  }

  /**
   * gets all info about a specific item
   */
  function fetchItemData() {
    let thisID = this.id;
    fetch(BASE_URL + ITEM_URL + "/?id=" + thisID)
      .then(statusCheck)
      .then(res => res.json())
      .then(setItemData)
      .catch(catchError);
  }

  /**
   * uses response from pokemart database to populate item info tab
   * @param {element} result - database response
   */
  function setItemData(result) {
    /*
     * set description for item-info
     * set amount for (new element required)
     * set cost for new hidden element
     */
    currentItemAmount = result[0]['amount'];
    currentItemCost = result[0]['price'];
    currentItemImage = result[0]['image'];
    currentItemDesciption = result[0]['description'];
    currentItemName = result[0]['item'];
    currentItemRating = result[0]['rating'];

    id("item-view").classList.remove("hidden");
    id("username").classList.add("hidden");
    if (currentItemAmount !== 0 && currentItemCost <= currentUserBalance) {
      id("item-purchase").removeAttribute("disabled", "");
      currentItemAmount--;
      id('amount').textContent = 'in stock: ' + currentItemAmount;
    } else {
      id("item-purchase").setAttribute("disabled", "");
    }
    id('item-img').src = '/img/' + currentItemImage;
    id('amount').textContent = 'in stock: ' + currentItemAmount;
    id('price').textContent = 'cost: ' + currentItemCost;
    if (currentItemRating !== '') {
      id('item-description').textContent = currentItemDesciption + " (ratings: " +
       currentItemRating + "/5)";
    } else {
      id('item-description').textContent = currentItemDesciption;
    }
  }

  /**
   * grabs cost of an item and subtracts from user's balance
   */
  function purchaseItem() {
    let data = new FormData();
    if (currentItemCost <= currentUserBalance) {
      currentUserBalance -= currentItemCost;
    }
    if (currentItemAmount !== 0 && currentItemCost <= currentUserBalance) {
      id("item-purchase").removeAttribute("disabled", "");
      currentItemAmount--;
      id('amount').textContent = 'in stock: ' + currentItemAmount;
    } else {
      id("item-purchase").setAttribute("disabled", "");
    }
    if (currentUser && currentItemName !== null && currentItemCost && currentItemAmount) {
      data.append('user', currentUser);
      data.append('cost', currentItemCost);
      data.append('item', currentItemName);
      data.append('itemamount', currentItemAmount);
      fetch('/pokemart/purchase', {method: 'POST', body: data})
        .then(statusCheck)
        .then(res => res.text())
        .then(displayUserBalance)
        .catch(catchError);
    } else {
      id("item-info").textContent = "Please login to purchase a item";
    }
  }

  /**
   * displays the user's balance on the screen
   * @param {String} balance - the user's balance
   */
  function displayUserBalance(balance) {
    id("bottom").textContent = "₽" + balance;
    id("bottom").classList.remove("hidden");
    id("top").classList.remove("hidden");
    id("no-account").classList.add("hidden");
  }

  /**
   * checks for existing user session from pokemart database
   */
  function fetchUserData() {
    fetch(BASE_URL + "userdata")
      .then(statusCheck)
      .then(res => res.json())
      .then(processUserData)
      .catch(catchError);
  }

  /**
   * sets user session data (if session exists)
   * @param {element} result - database response
   */
  function processUserData(result) {
    if (!result[0]) {
      id("no-account").classList.remove("hidden");
    } else {
      currentUser = result[0]['username'];
      currentUserBalance = result[0]['balance'];
      displayUserBalance(currentUserBalance);
      id("username").textContent = "Welcome " + currentUser + "!";
      id("item-view").classList.add("hidden");
    }
  }

  /**
   * toggles on and off the hidden class
   */
  function toggleViews() {
    id('grid').classList.toggle('hidden');
    id('store-items-list').classList.toggle('hidden');
  }

  /* ------------------------------ Helper Functions  ------------------------------ */

  /**
   * Helper function to return the response's result text if successful, otherwise
   * returns the rejected Promise result with an error status and corresponding text
   * @param {object} res - response to check for success/error
   * @return {object} - valid response if response was successful, otherwise rejected
   *                    Promise result
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * lets player know if somthing went wrong
   */
  function catchError() {
    let revealText = qs("#item-info");
    revealText.textContent = "Something went wrong";
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} id - element ID
   * @return {object} DOM object associated with id.
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * shorthand for gen function + classList function
   * @param {string} el - element to generate
   * @return {object} DOM object with specified classes
   */
  function gen(el) {
    return document.createElement(el);
  }

  /**
   * shorthand for querySelector function
   * @param {string} selector - selector to query for
   * @return {object} first dom object matching passed selector
   */
  function qs(selector) {
    return document.querySelector(selector);
  }
})();