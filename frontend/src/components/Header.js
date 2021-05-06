import View from "../View.js";
import { fileToDataUrl, getTokenFromLocalStorage } from "../utils/helpers.js";
import API from "../utils/api.js";
import ContentCard from "../components/ContentCard.js";

const api = new API("http://127.0.0.1:5000");

/**
 * A header component
 *
 * Components:
 *  {title}: App title, link to homepage
 *  {avatar}: User avatar, link to profile if logged in
 *  {action buttons}:
 *    {home}: Link to homepage, always present
 *    {search}: TODO: search user by username, always present
 *    {add new post}: Publish a new post, present after user logged in
 *    {logout button}: Logout, present after user logged in
 */
export default class Header extends View {
  constructor(router) {
    super();
    this.container = document.createElement("header");
    this.container.className = "banner";
    const title = document.createElement("h1");
    title.id = "logo";
    title.textContent = "LinkedPic";

    // avatar
    const avatar = document.createElement("a");
    avatar.href = "/";
    avatar.className = "user_avatar material-icons";
    avatar.textContent = "account_circle";

    // collapse container
    const collapseContainer = document.createElement("div");
    collapseContainer.className = "collapse_container";

    // home button
    const home = document.createElement("a");
    home.className = "material-icons";
    home.textContent = "home";
    home.href = "/";
    home.addEventListener("click", function (e) {
      e.preventDefault();
      router.visit(this.href);
    });

    // new post form
    const container = document.createElement("div");
    container.id = "new_post_form";
    container.style.display = "none";
    const newPostForm = document.createElement("form");
    const textInput = document.createElement("textarea");
    textInput.className = "post_description";
    textInput.placeholder = "Share your thought...";
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/png";
    fileInput.style.width = "100%";
    const postSubmitBtn = document.createElement("input");
    postSubmitBtn.type = "submit";
    postSubmitBtn.className = "btn";
    postSubmitBtn.value = "Publish";
    const msgContainer = document.createElement("div");
    const msg = document.createElement("span");
    msgContainer.className = "submit_message";
    msgContainer.dataset.state = "error";
    msg.textContent = "";
    const closeMsgBtn = document.createElement("span");
    closeMsgBtn.className = "material-icons";
    closeMsgBtn.textContent = "close";
    closeMsgBtn.addEventListener("click", () => {
      msgContainer.style.display = "none";
    });
    msgContainer.appendChild(msg);
    msgContainer.appendChild(closeMsgBtn);
    const closeEditBtn = document.createElement("span");
    closeEditBtn.className = "material-icons float";
    closeEditBtn.textContent = "cancel";
    closeEditBtn.addEventListener("click", function () {
      container.style.display = "none";
      msgContainer.style.display = "none";
    });
    [
      textInput,
      fileInput,
      postSubmitBtn,
      msgContainer,
      closeEditBtn,
    ].forEach((ele) => newPostForm.appendChild(ele));
    newPostForm.addEventListener("click", function (e) {
      // form is nested inside a div, this allows the choose file button to be
      // recoginisable
      e.stopPropagation();
    });
    postSubmitBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (textInput.value === "") {
        msg.textContent = "Description can not be empty";
        msgContainer.dataset.state = "error";
        textInput.focus();
        msgContainer.style.display = "flex";
      } else if (!fileInput.files.length) {
        msg.textContent = "You have to upload a file";
        msgContainer.dataset.state = "error";
        fileInput.focus();
        msgContainer.style.display = "flex";
      } else if (fileInput.files[0].type !== "image/png") {
        msg.textContent = "Sorry, we only support PNG's";
        msgContainer.dataset.state = "error";
        fileInput.focus();
        msgContainer.style.display = "flex";
      } else {
        // post to server
        const token = getTokenFromLocalStorage();
        const image = fileInput.files[0];
        fileToDataUrl(image)
          .then((url) => url.replace(/data:image\/png;base64,\s*/, ""))
          .then((base) => {
            return api.makeAPIRequest("post/", {
              method: "POST",
              headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                description_text: textInput.value,
                src: base,
              }),
            });
          })
          .then((res) => res.json())
          .then((json) => {
            // console.log("Your new post id:", json.post_id);
            // update UI: append a card to feed container
            return api.makeAPIRequest(`post/?id=${json.post_id}`, {
              headers: {
                Authorization: `Token ${token}`,
              },
            });
          })
          .then((res) => res.json())
          .then((post) => {
            const feedContainer = document.querySelector(".feed_container");
            feedContainer.appendChild(new ContentCard(post).container);
            msg.textContent = "Done";
            msgContainer.dataset.state = "ok";
            newPostForm.reset();
            msgContainer.style.display = "flex";
          })
          .catch((err) => {
            msg.textContent = err.message;
            msgContainer.dataset.state = "error";
            fileInput.focus();
          });
      }
    });
    container.appendChild(newPostForm);

    // new post button
    const newPostBtn = document.createElement("a");
    newPostBtn.className = "material-icons new_post_btn";
    newPostBtn.textContent = "post_add";
    newPostBtn.addEventListener("click", (e) => {
      e.preventDefault();
      container.style.display = "flex";
      textInput.focus();
    });

    // Search bar
    const search = document.createElement("a");
    search.className = "material-icons";
    search.textContent = "search";

    // logout button
    const logOutBtn = document.createElement("a");
    logOutBtn.className = "logout material-icons";
    logOutBtn.dataset.show = "false";
    logOutBtn.textContent = "logout";

    [home, search, newPostBtn, logOutBtn].forEach((ele) => {
      ele.tabIndex = "0";
      collapseContainer.appendChild(ele);
    });

    this.children = [title, avatar, container, collapseContainer];
    logOutBtn.addEventListener("click", function (e) {
      localStorage.removeItem("user");
      router.visit("/");
    });
    this.assemble();
  }
}
