import API from "../utils/api.js";
import View from "../View.js";
import Router from "../utils/router.js";

/**
 * A form(log in & sign up) component
 */

/**
 * Helper function to make an html input element
 */
function input(
  type,
  id,
  placeholder,
  name = null,
  autocomplete = "off",
  required = true
) {
  const node = document.createElement("input");
  node.type = type;
  node.id = id;
  node.name = name ? name : id;
  node.placeholder = placeholder;
  node.autocomplete = autocomplete;
  required && node.setAttribute("required", "");
  type === "email" && node.setAttribute("pattern", ".+@.+..+");
  return node;
}

/**
 * Helper function to make an html submit button
 */
function button(className, id, value) {
  const node = document.createElement("input");
  node.type = "submit";
  node.className = className;
  node.id = id;
  node.value = value;
  return node;
}

/**
 * A form validater using JS form validation API
 * @param {HTMLElement} form the from to be validated
 * @param {string} view current view, alters validation accordingly
 * @returns
 */
function validateForm(form, view) {
  // reset custom validity
  view === "signup" && form.confirm.setCustomValidity("");
  form.username.setCustomValidity("");
  if (form.reportValidity()) {
    if (view === "signup" && form.password.value !== form.confirm.value) {
      form.confirm.setCustomValidity("Passwords do not match");
      form.reportValidity();
      return false;
    }
    return true;
  }
  return false;
}

/**
 * Post a form to the server to the given endpoint
 */
function postForm(form, api, payload, router, view) {
  const options = {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(payload),
  };
  api
    .makeAPIRequest(`auth/${view}`, options)
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      } else if (res.status === 403) {
        form.username.setCustomValidity(
          "User doesn't exit or incorrect password"
        );
        form.reportValidity();
      } else if (res.status === 409) {
        form.username.setCustomValidity("User name already exits");
        form.reportValidity();
      }
    })
    .then((data) => {
      if (data) {
        // store user profile in localStorage
        const user = { token: data.token };
        api
          .makeAPIRequest("user", {
            headers: {
              Authorization: `Token ${data.token}`,
            },
          })
          .then((res) => res.json())
          .then((json) => {
            user.id = json.id;
            user.name = json.name;
            user.username = json.username;
            user.email = json.email;
            return user;
          })
          .then((user) => {
            localStorage.setItem("user", JSON.stringify(user));
            // route to "/" view
            router.visit("/");
          })
          .catch((err) => console.warn(err.message));
      }
    })
    .catch((err) => console.warn(err.message));
}

function handleSubmit(form, view, e, router) {
  e.preventDefault();
  if (!validateForm(form, view)) {
    return;
  }

  const payload = {
    username: form.username.value,
    password: form.password.value,
  };
  const api = new API("http://127.0.0.1:5000");
  if (view === "signup") {
    payload.email = form.email.value;
    payload.name = form.name.value;
  }
  postForm(form, api, payload, router, view);
}

export default class Form extends View {
  constructor(view) {
    super();
    this.container.className = "form_container";
    const router = new Router(document.querySelector("main"));
    const title = document.createElement("h2");
    title.className = "form_title";

    const form = document.createElement("form");
    form.className = `form form_${view}`;
    form.setAttribute("action", "POST");

    const username = input("text", "username", "Username");
    const password = input(
      "password",
      "password",
      "Password",
      "current-password"
    );
    const confirm = input(
      "password",
      "confirm",
      "Confirm your password",
      "new-password"
    );
    const email = input("email", "email", "Enter your email address");
    const name = input("text", "name", "Enter your name");
    form.appendChild(username);
    form.appendChild(password);

    const submitBtn = button("btn btn_primary", "btn_submit", "Log In");
    const reminder = document.createElement("div");
    reminder.className = "form_reminder";

    const link = document.createElement("a");
    link.dataset.link = "";
    if (view === "signup") {
      title.textContent = "Sign Up";
      password.setAttribute("autocomplete", "new-password");
      form.appendChild(confirm);
      form.appendChild(email);
      form.appendChild(name);
      submitBtn.value = "Sign up";
      reminder.textContent = "Already have an account? ";
      link.href = "/login";
      link.textContent = "Log in";
    } else {
      title.textContent = "Welcome Back!";
      reminder.textContent = "Don't have an account? ";
      link.href = "/signup";
      link.textContent = "Sign up";
    }
    link.addEventListener("click", function (e) {
      e.preventDefault();
      router.visit(this.href);
    });
    reminder.appendChild(link);
    form.appendChild(submitBtn);
    this.container.appendChild(title);
    this.container.appendChild(form);
    this.container.appendChild(reminder);

    // Add event listeners to button and link
    submitBtn.addEventListener("click", (e) =>
      handleSubmit(form, view, e, router)
    );
  }
}
