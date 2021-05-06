import Home from "../pages/Home.js";
import Feed from "../pages/Feed.js";
import Profile from "../pages/Profile.js";
import { getTokenFromLocalStorage } from "../utils/helpers.js";

/**
 * A client side router:
 * routes when any link/button with a data-link attribute is clicked on,
 * or explicitly called by an element.
 */
export default function Router(node) {
  this.node = node;
  this.routes = [
    { path: "/", view: Feed },
    { path: "/login", view: Home },
    { path: "/signup", view: Home },
    { path: "/feed", view: Feed },
    { path: "/profile", view: Profile },
  ];
}

Router.prototype.visit = function (url) {
  history.pushState(null, null, url);
  this.route();
};

Router.prototype.route = function () {
  const path = location.pathname;
  const currentPage = this.routes.find((route) => {
    if (route.path === "/") {
      return path === "/";
    }
    return path.match(route.path);
  });
  const token = getTokenFromLocalStorage();
  const currentView = this.node.firstElementChild;
  let newView;
  if (!currentPage) {
    console.log("No route found, double check the url");
  } else {
    if (currentPage.path === "/") {
      if (!token) {
        return this.visit(`${location.href}login`);
      } else {
        newView = new currentPage.view(token);
      }
    } else if (currentPage.path === "/profile") {
      const username = path.match(/\/profile\/(.+)/)[1];
      newView = new currentPage.view(token, username);
    } else {
      newView = new currentPage.view(currentPage.path.slice(1));
    }
  }
  currentView && currentView.remove();
  newView.mountAt(this.node);

  // Add additional buttons to header if user logged in
  const avatar = document.querySelector(".user_avatar");
  const logOutBtn = document.querySelector(".logout");
  const newPostBtn = document.querySelector(".new_post_btn");
  if (getTokenFromLocalStorage() && logOutBtn.dataset.show === "false") {
    const username = JSON.parse(localStorage.getItem("user")).username;
    avatar.href = `/profile/${username}`;
    avatar.textContent = username[0].toUpperCase();
    avatar.classList.remove("material-icons");
    logOutBtn.dataset.show = "true";
    logOutBtn.style.display = "initial";
    newPostBtn.style.display = "initial";
  } else if (!getTokenFromLocalStorage()) {
    avatar.href = "/";
    avatar.textContent = "account_circle";
    avatar.classList.add("material-icons");
    logOutBtn.dataset.show = "false";
    logOutBtn.style.display = "none";
    newPostBtn.style.display = "none";
  }

  // Enable browser history
  window.onpopstate = () => {
    this.visit(location.href);
  };
};
