/**
 * This file has the functionality for
 * files realted with accounts.
 */

'use strict';
(function() {
  const BASE_URL = "/pokemart/";
  window.addEventListener('load', init);

  /**
   * add an event listener for the back button to
   * change pages when pressed.
   */
  function init() {
    id('back').addEventListener('click', changePage);
    id('review-button').addEventListener('click', writeReview);
    fetchUser();
  }

  /**
   * gathers information related to the user
   */
  function fetchUser() {
    fetch(BASE_URL + "userdata")
      .then(statusCheck)
      .then(res => res.json())
      .then(fetchUserHistory)
      .catch(errorHandle);
  }

  /**
   * gathers information for the username
   * @param {element} result element
   */
  function fetchUserHistory(result) {
    let data = new FormData();
    data.append('username', result[0]['username']);
    fetch(BASE_URL + 'history', {method: 'POST', body: data})
      .then(statusCheck)
      .then(res => res.json())
      .then(processUserHistory)
      .catch(errorHandle);
  }

  /**
   * populates the history of a user's purchases
   * @param {element} result element
   */
  function processUserHistory(result) {
    let parent = qs("#history");
    parent.innerHTML = '';
    for (let i = 0; i < result.length; i++) {
      let newItem = gen("button");
      newItem.classList.add("item");
      parent.appendChild(newItem);
      let item = gen("p");
      item.textContent = result[i].item;
      let date = gen("p");
      date.textContent = new Date(result[i].date).toLocaleString();
      newItem.appendChild(item);
      newItem.appendChild(date);
    }
  }

  /**
   * submits a review from the user
   */
  function writeReview() {
    let data = new FormData();
    data.append('username', id("username").value);
    data.append('item', id("item").value);
    data.append('rating', id("rating").value);
    data.append('feedback', id("feedback").value);
    fetch(BASE_URL + 'review', {method: 'POST', body: data})
      .then(statusCheck)
      .then(res => res.text())
      .then(displayReviewResult)
      .catch(errorHandle);
  }

  /**
   * displays whether or not review was successful
   * @param {element} result - database response
   */
  function displayReviewResult(result) {
    id("review-result").textContent = result;
  }

  /**
   * changes pages to index.html
   */
  function changePage() {
    window.location.href = 'index.html';
  }

  /**
   * handles the error
   */
  function errorHandle() {
    let revealText = qs("#review-result");
    revealText.textContent = "Something went wrong";
  }

  /* ------------------------------ Helper Functions  ------------------------------ */
  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} id - element ID
   * @return {object} DOM object associated with id.
   */
  function id(id) {
    return document.getElementById(id);
  }

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
   * shorthand for querySelector function
   * @param {string} selector - selector to query for
   * @return {object} first dom object matching passed selector
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * shorthand for gen function + classList function
   * @param {string} el - element to generate
   * @return {object} DOM object with specified classes
   */
  function gen(el) {
    return document.createElement(el);
  }
})();