/**
 * Functionality of login page.
 */
'use strict';
(function() {
  window.addEventListener('load', init);

  /**
   * allows three courses of actions to be produced.
   */
  function init() {
    id('back').addEventListener('click', changePage);
    id('login').addEventListener('click', login);
    id('register').addEventListener('click', register);
  }

  /**
   * changes pages to index.html.
   * @param {String} result - determines if the account is valid
   */
  function changePage(result) {
    if (result === "account does not exist") {
      id('error').classList.remove("hidden");
    } else if (result === "that username or email is already in use") {
      id('error-reg').classList.remove("hidden");
    } else {
      window.location.href = 'index.html';
      id('error').classList.add("hidden");
      id('error-reg').classList.add("hidden");
    }
  }

  /**
   * allows users to login if account exists. in addition, it
   * chcecks if there is a valid account.
   */
  function login() {
    hideErrors();
    let data = new FormData();
    data.append('username', id('username').value);
    data.append('email', id('email').value);
    data.append('password', id('password').value);

    if (!(id('username').value) || !(id('email').value) || !(id('password').value)) {
      emptyError();
    } else {
      fetch('/pokemart/login', {method: 'POST', body: data})
        .then(statusCheck)
        .then(res => res.text())
        .then(changePage)
        .catch(console.error);
    }
  }

  /**
   * registers an account for new users.
   */
  function register() {
    hideErrors();
    let data = new FormData();
    data.append('username', id('username').value);
    data.append('email', id('email').value);
    data.append('password', id('password').value);

    if (!(id('username').value) || !(id('email').value) || !(id('password').value)) {
      emptyError();
    } else {
      fetch('/pokemart/register', {method: 'POST', body: data})
        .then(statusCheck)
        .then(res => res.text())
        .then(changePage)
        .catch(console.error);
    }
  }

  /**
   * when called, removes the hidden class to showcase an error in login
   */
  function emptyError() {
    id('error-empty').classList.remove('hidden');
  }

  /**
   * hides all error messages on screen to declutter
   */
  function hideErrors() {
    id('error').classList.add("hidden");
    id('error-reg').classList.add("hidden");
    id('error-empty').classList.add("hidden");
  }

  /**
   * Helper function to return the response's result text if successful, otherwise
   * returns the rejected Promise result with an error status and corresponding text
   * @param {object} res - response to check for success/error
   * @return {object} - valid response if response was successful, otherwise rejected Promise result
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} id - element ID
   * @return {object} DOM object associated with id.
   */
  function id(id) {
    return document.getElementById(id);
  }
})();