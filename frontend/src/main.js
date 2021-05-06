import Router from "./utils/router.js";
import Header from "./components/Header.js";

document.addEventListener("DOMContentLoaded", () => {
  const app = document.querySelector("#root");
  const router = new Router(app.querySelector("main"));
  const header = new Header(router);
  header.mountAt(app);

  // event delegation
  header.container.addEventListener("click", function (e) {
    e.preventDefault();
    if (e.target.id === "logo") {
      router.visit("/");
    } else if (e.target.className === "user_avatar") {
      router.visit(e.target.href);
    }
  });

  // initialize the app
  router.route();
});
