import View from "../View.js";
import ContentCard from "../components/ContentCard.js";
import API from "../utils/api.js";
import Router from "../utils/router.js";

/**
 * User profile page, access via search (TODO) and link clicking.
 * Components:
 *  {PersonalInfo} displays user info, editable if belongs to user currently logged in
 *  {PostContainer} list of posts the user posted
 *  {Network} displays user network: followers (number), followings (list, able to follow/unfollow)
 */

const api = new API("http://127.0.0.1:5000");

class PersonalInfo extends View {
  constructor(isSelf = false, avatar, name, username, email, token) {
    super();
    this.container.className = "personal_info";
    const formContainer = document.createElement("form");
    const formBg = document.createElement("div");
    formBg.className = "form_bg";
    formBg.style.display = "none";
    const inputsContainer = document.createElement("div");
    inputsContainer.className = "hidden_container";
    inputsContainer.style.display = "none";
    const avatarView = document.createElement("span");
    avatarView.className = "user_avatar";
    avatarView.textContent = avatar[0].toUpperCase();
    const usernameView = document.createElement("span");
    usernameView.textContent = `Username: ${username}`;
    const nameView = document.createElement("span");
    nameView.textContent = `Name: ${name}`;
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Enter your new name";
    nameInput.setAttribute("required", "");
    const emailView = document.createElement("span");
    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.setAttribute("pattern", ".+@.+..+");
    emailInput.setAttribute("required", "");
    emailInput.placeholder = "Enter your new email";
    emailView.textContent = `Email: ${email}`;
    const password = document.createElement("input");
    password.type = "password";
    password.placeholder = "Enter a new password";
    password.setAttribute("required", "");
    const confirm = document.createElement("input");
    confirm.type = "password";
    confirm.placeholder = "Confirm new password";
    confirm.setAttribute("required", "");

    [nameInput, emailInput, password, confirm].forEach((ele) => {
      inputsContainer.appendChild(ele);
    });
    formContainer.appendChild(inputsContainer);
    this.children = [
      avatarView,
      usernameView,
      nameView,
      emailView,
      formContainer,
      formBg,
    ];

    // Update user info
    if (isSelf) {
      const editBtn = document.createElement("input");
      editBtn.type = "submit";
      editBtn.className = "btn";
      editBtn.value = "Edit";
      editBtn.style.display = "block";
      editBtn.setAttribute("style", "display:block;margin:1em auto");
      const msgContainer = document.createElement("div");
      const msg = document.createElement("span");
      const closeBtn = document.createElement("span");
      closeBtn.className = "material-icons";
      closeBtn.textContent = "close";
      closeBtn.addEventListener("click", () => {
        msgContainer.style.display = "none";
      });
      msgContainer.className = "submit_message";
      msgContainer.dataset.state = "error";
      msg.textContent = "";
      const closeEditBtn = document.createElement("span");
      closeEditBtn.className = "material-icons float";
      closeEditBtn.textContent = "cancel";
      closeEditBtn.addEventListener("click", function () {
        this.style.display = "none";
        inputsContainer.style.display = "none";
        msgContainer.style.display = "none";
        formBg.style.display = "none";
        formContainer.className = "";
        editBtn.value = "Edit";
      });
      editBtn.addEventListener("click", function (e) {
        e.preventDefault();
        const mql = window.matchMedia("(max-width: 900px)");
        if (inputsContainer.style.display === "none") {
          mql.matches &&
            ((formContainer.className = "float"),
            (formBg.style.display = "initial"));
          inputsContainer.style.display = "flex";
          nameInput.focus();
          this.value = "Submit";
          closeEditBtn.style.display = "initial";
        } else {
          if (formContainer.reportValidity()) {
            if (password.value !== confirm.value) {
              msg.textContent = "Passwords do not match";
              msgContainer.dataset.state = "error";
              confirm.focus();
              msgContainer.style.display = "flex";
            } else {
              //put to server
              const payload = {
                email: emailInput.value,
                name: nameInput.value,
                password: password.value,
              };
              api
                .makeAPIRequest("user", {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                  },
                  body: JSON.stringify(payload),
                })
                .then(() => {
                  msgContainer.dataset.state = "ok";
                  msg.textContent = "Done!";
                  this.value = "Edit";
                  this.blur();
                  // inputsContainer.style.display = "none";
                  // closeEditBtn.style.display = "none";
                  nameView.textContent = `Name: ${nameInput.value}`;
                  emailView.textContent = `Email: ${emailInput.value}`;
                  formContainer.reset();
                })
                .then(() => {
                  msgContainer.style.display = "flex";
                });
            }
          }
        }
      });
      formContainer.appendChild(editBtn);
      formContainer.appendChild(closeEditBtn);
      msgContainer.appendChild(msg);
      msgContainer.appendChild(closeBtn);
      formContainer.appendChild(msgContainer);
    }
    this.assemble();
  }
}

class PostsContainer extends View {
  constructor(posts, token) {
    super();
    this.container.className = "feed_container";
    posts.forEach((postId) => {
      api
        .makeAPIRequest(`post?id=${postId}`, {
          headers: { Authorization: `Token ${token}` },
        })
        .then((res) => res.json())
        .then((post) => {
          const card = new ContentCard(post, true);
          card.mountAt(this.container);
        });
    });
  }
}

class Network extends View {
  constructor(following, num_followers, token, router) {
    super();
    this.container.className = "personal_info network";
    const followers = document.createElement("span");
    followers.dataset.num = num_followers;
    followers.id = "num_followers";
    followers.textContent = " followers";
    const title = document.createElement("span");
    title.dataset.num = following.length;
    title.id = "following_title";
    title.textContent = " following";
    const followingContainer = document.createElement("ul");
    followingContainer.className = "following_container";
    // rendern list of perple following
    following.forEach((userId) => {
      api
        .makeAPIRequest(`user?id=${userId}`, {
          headers: { Authorization: `Token ${token}` },
        })
        .then((res) => res.json())
        .then((user) => {
          const item = document.createElement("li");
          const link = document.createElement("a");
          link.href = `/profile/${user.username}`;
          link.textContent = user.name;
          link.addEventListener("click", function (e) {
            e.preventDefault();
            router.visit(this.href);
          });
          const button = document.createElement("button");
          button.className = "btn";
          button.dataset.action = "unfollow";
          button.addEventListener("click", function () {
            // follow/unfollow user
            const following = button.dataset.action === "unfollow";
            // put to server
            api
              .makeAPIRequest(
                `user/${following ? "unfollow" : "follow"}?username=${
                  user.username
                }`,
                {
                  method: "PUT",
                  headers: {
                    Authorization: `Token ${token}`,
                  },
                }
              )
              .then(() => {
                // update UI
                if (following) {
                  button.dataset.action = "follow";
                  title.dataset.num--;
                } else {
                  button.dataset.action = "unfollow";
                  title.dataset.num++;
                }
              });
          });
          item.appendChild(link);
          item.appendChild(button);
          followingContainer.appendChild(item);
        });
    });
    this.children = [followers, title, followingContainer];
    this.assemble();
  }
}

export default class Profile extends View {
  constructor(token, username) {
    super();
    this.container.className = "profile_container";
    // get user info of the given username
    const router = new Router(document.querySelector("main"));
    api
      .makeAPIRequest(`user?username=${username}`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => res.json())
      .then((user) => {
        const isSelf =
          user.username === JSON.parse(localStorage.getItem("user")).username;
        const personalInfo = new PersonalInfo(
          isSelf,
          user.name, // as avatar
          user.name,
          user.username,
          user.email,
          token
        );
        // const token = getTokenFromLocalStorage();
        const postsContainer = new PostsContainer(user.posts, token);
        const network = new Network(
          user.following,
          user.followed_num,
          token,
          router
        );
        this.children = [personalInfo, postsContainer, network];
        this.assemble();
      });
  }
}
