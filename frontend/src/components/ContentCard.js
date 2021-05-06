import View from "../View.js";
import API from "../utils/api.js";
import Router from "../utils/router.js";
import { getTokenFromLocalStorage } from "../utils/helpers.js";

/**
 * A post card view
 * @param {Object} post a post got from the server api "/user/feed"
 */

const api = new API("http://127.0.0.1:5000");

class FeedAuthor extends View {
  constructor(author, date, router, contentView, card, postID, token, isSelf) {
    super();
    this.container.className = "feed_user_container";
    const avatar = document.createElement("a");
    const username = document.createElement("span");
    const feedDate = document.createElement("span");
    avatar.className = "user_avatar";
    username.className = "user_name";
    feedDate.className = "feed_date";
    avatar.textContent = author[0].toUpperCase();
    avatar.href = `/profile/${author}`;
    username.textContent = author;
    feedDate.textContent = new Date(parseFloat(date) * 1000).toLocaleString();

    // Click avatar to view user profile
    avatar.addEventListener("click", function (e) {
      e.preventDefault();
      router.visit(this.href);
    });
    this.children = [avatar, username, feedDate];

    // Enable edit if a post belongs to the user logged in
    if (isSelf) {
      const btnContainer = document.createElement("span");
      const editBtn = document.createElement("span");
      const confirmBtn = document.createElement("span");
      const abortBtn = document.createElement("span");
      const deleteBtn = document.createElement("span");
      btnContainer.className = "btn_container";
      editBtn.textContent = "create";
      confirmBtn.textContent = "check";
      abortBtn.textContent = "close";
      deleteBtn.textContent = "remove_circle";
      confirmBtn.style.display = "none";
      abortBtn.style.display = "none";
      [editBtn, confirmBtn, abortBtn, deleteBtn].forEach((ele) => {
        ele.className = "material-icons btn";
        btnContainer.appendChild(ele);
      });
      deleteBtn.classList.add("delete");

      //Edit post
      const post_content = contentView.container.querySelector(
        ".feed_description_container"
      );
      let currentPostContent = post_content.textContent;
      btnContainer.addEventListener("click", function (e) {
        e.stopPropagation();
        if (e.target === editBtn) {
          confirmBtn.style.display = "initial";
          abortBtn.style.display = "initial";
          post_content.setAttribute("contenteditable", "true");
          post_content.focus();
        } else if (e.target === confirmBtn) {
          // commit edits to server
          if (post_content.textContent !== currentPostContent) {
            api
              .makeAPIRequest(`post/?id=${postID}`, {
                method: "PUT",
                headers: {
                  Authorization: `Token ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  description_text: post_content.textContent,
                }),
              })
              .then(() => {
                post_content.setAttribute("contenteditable", "false");
                btnContainer.classList.add("ok");
                currentPostContent = post_content.textContent;
                setTimeout(() => {
                  btnContainer.classList.remove("ok");
                  confirmBtn.style.display = "none";
                  abortBtn.style.display = "none";
                }, 1500);
              });
          }
        } else if (e.target === abortBtn) {
          // Abort edits
          post_content.setAttribute("contenteditable", "false");
          confirmBtn.style.display = "none";
          abortBtn.style.display = "none";
          post_content.textContent = currentPostContent;
        } else if (e.target === deleteBtn) {
          // Delet post
          api
            .makeAPIRequest(`post/?id=${postID}`, {
              method: "DELETE",
              headers: {
                Authorization: `Token ${token}`,
              },
            })
            .then(() => {
              card.remove(); // Update UI
            });
        }
      });
      this.children.push(btnContainer);
    }
    this.assemble();
  }
}

class FeedContent extends View {
  constructor(src, text) {
    super();
    this.container.className = "feed_content_container";
    const image = document.createElement("img");
    image.className = "feed_image";
    image.dataset.size = "small";
    image.src = `data:image/png;base64, ${src}`;
    const description = document.createElement("div");
    description.className = "feed_description_container";
    description.textContent = text;
    this.children = [image, description];
    this.assemble();
  }
}

class LikedList extends View {
  constructor(currentUser, likes, token, router) {
    super();
    this.container.className = "likes_list_container hidden_container";
    this.container.dataset.show = "false";
    const ul = document.createElement("ul");
    ul.className = "likes_list";
    const options = { headers: { Authorization: `Token ${token}` } };
    likes.forEach((userID) => {
      api
        .makeAPIRequest(`user?id=${userID}`, options)
        .then((res) => res.json())
        .then((data) => {
          const li = document.createElement("li");
          const link = document.createElement("a");
          link.href = `/profile/${data.name}`;
          if (userID === currentUser.id) {
            link.textContent = "you";
            li.className = "self";
          } else {
            link.textContent = data.name;
          }
          link.addEventListener("click", function (e) {
            e.preventDefault();
            router.visit(this.href);
          });
          li.appendChild(link);
          ul.appendChild(li);
        });
    });
    const text = document.createElement("span");
    text.textContent = "liked this post";
    ul.appendChild(text);
    this.container.appendChild(ul);
  }
}

class FeedActions extends View {
  constructor(currentUser, likes, comments, id, likesList, commentList, token) {
    super();
    this.container.className = "feed_actions_container";
    const likeBtn = document.createElement("span");
    const numLikes = document.createElement("button");
    const commentBtn = document.createElement("span");
    const numComments = document.createElement("button");
    likeBtn.className = "material-icons likeBtn";
    likeBtn.dataset.filled = "false";
    commentBtn.className = "material-icons commentBtn";
    numLikes.className = "num_likes";
    numLikes.setAttribute("disabled", "");
    numLikes.dataset.num = 0;
    numLikes.addEventListener("click", function (e) {
      e.preventDefault();
    });
    numComments.className = "num_comments";
    numComments.dataset.num = 0;
    numComments.setAttribute("disabled", "");
    numComments.addEventListener("click", function (e) {
      e.preventDefault();
    });
    if (likes.length) {
      numLikes.dataset.num = likes.length;
      numLikes.textContent += " view all";
      numLikes.removeAttribute("disabled");
      if (likes.find((userID) => userID === currentUser.id)) {
        likeBtn.dataset.filled = "true";
      }
    }
    if (comments.length) {
      numComments.dataset.num = comments.length;
      numComments.textContent += " view all";
      numComments.removeAttribute("disabled");
    }
    // 2.3.1 show/hide likes
    numLikes.addEventListener("click", function () {
      const show = likesList.container.dataset.show === "true";
      likesList.container.dataset.show = !show;
      this.textContent = show ? " view all" : " hide all";
    });

    // 2.3.2 show/hide comments
    numComments.addEventListener("click", function () {
      const show = commentList.container.dataset.show === "true";
      commentList.container.dataset.show = !show;
      this.textContent = show ? " view all" : " hide all";
    });

    // 2.3.3 like/unlike a post
    likeBtn.addEventListener("click", function () {
      const liked = this.dataset.filled === "true";
      this.dataset.filled = !liked;
      if (liked) {
        numLikes.dataset.num--;
        if (numLikes.dataset.num === "0") {
          numLikes.textContent = "";
          numLikes.setAttribute("disabled", "");
        }
        api.like("post/unlike", token, id).then(() => {
          likesList.container.querySelector(".self").remove();
        });
      } else {
        numLikes.dataset.num++;
        numLikes.removeAttribute("disabled");
        if (numLikes.textContent === "") {
          numLikes.textContent += " view all";
        }
        api.like("post/like", token, id).then(() => {
          const li = document.createElement("li");
          const link = document.createElement("a");
          li.className = "self";
          link.textContent = "you";
          link.href = "";
          li.appendChild(link);
          likesList.container.firstChild.appendChild(li);
        });
      }
    });

    this.children = [likeBtn, numLikes, commentBtn, numComments];
    this.assemble();
  }
}

class Comment extends View {
  constructor(comment, router) {
    super();
    this.container.className = "comment";
    const user = document.createElement("a");
    const date = document.createElement("span");
    const text = document.createElement("p");
    user.href = `/profile/${comment.author}`;
    user.addEventListener("click", function (e) {
      e.preventDefault();
      router.visit(this.href);
    });
    const currentUser = JSON.parse(localStorage.getItem("user")).username;
    if (comment.author === currentUser) {
      user.textContent = "you";
      user.className = "self";
    } else {
      user.textContent = comment.author;
    }
    date.textContent = new Date(
      parseFloat(comment.published) * 1000
    ).toLocaleString();
    text.textContent = comment.comment;
    this.children = [user, date, text];
    this.assemble();
  }
}

class CommentList extends View {
  constructor(comments, router) {
    super();
    this.container.className = "comments_list_container hidden_container";
    this.container.dataset.show = "false";
    comments.forEach((comment) => {
      const commentView = new Comment(comment, router);
      this.children.push(commentView);
    });
    this.assemble();
  }
}

class FeedCommentInput extends View {
  constructor(token, commentList, numComments, username, postID) {
    super();
    this.container.className = "commentInput_container";
    const input = document.createElement("input");
    const button = document.createElement("button");
    input.className = "comment_input";
    input.type = "text";
    input.placeholder = "Leave a comment...";
    button.textContent = "keyboard_return";
    button.className = "material-icons comment_submit_btn";
    button.setAttribute("disabled", "");
    input.addEventListener("keyup", function () {
      button.disabled = this.value.trim() === "";
    });
    // Leave a comment
    button.addEventListener("click", () => {
      // update UI
      const payload = {
        author: username,
        published: `${Date.now() / 1000}`,
        comment: input.value,
      };
      commentList.container.prepend(new Comment(payload).container);
      if (numComments.dataset.num === "0") {
        numComments.textContent += " view all";
        numComments.removeAttribute("disabled");
      }
      numComments.dataset.num++;
      // put to server
      api
        .makeAPIRequest(`post/comment?id=${postID}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ comment: input.value }),
        })
        .then(() => {
          input.value = "";
        });
    });
    this.children = [input, button];
    this.assemble();
  }
}

export default class ContentCard extends View {
  constructor(post, isSelf = false) {
    super();
    this.container.className = "card_container";
    const token = getTokenFromLocalStorage();
    const app = document.querySelector("main");
    const router = new Router(app);
    const content = new FeedContent(
      post.thumbnail,
      post.meta.description_text,
      isSelf
    );
    const author = new FeedAuthor(
      post.meta.author,
      post.meta.published,
      router,
      content,
      this.container,
      post.id,
      token,
      isSelf
    );
    const image = content.container.querySelector(".feed_image");
    content.container.addEventListener("click", function (e) {
      if (e.target === image) {
        const switchToLarge = image.dataset.size === "small";
        image.src = `data:image/png;base64, ${
          switchToLarge ? post.src : post.thumbnail
        }`;
        image.dataset.size = switchToLarge ? "large" : "small";
        this.style.flexDirection = switchToLarge ? "column" : "row";
      }
    });
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const likesList = new LikedList(
      currentUser,
      post.meta.likes,
      token,
      router
    );
    const commentList = new CommentList(post.comments, router);
    const actions = new FeedActions(
      currentUser,
      post.meta.likes,
      post.comments,
      post.id,
      likesList,
      commentList,
      token
    );
    const input = new FeedCommentInput(
      token,
      commentList,
      actions.container.querySelector(".num_comments"),
      currentUser.username,
      post.id
    );
    this.children = [author, content, actions, likesList, commentList, input];
    this.assemble();
    const commentBtn = actions.container.querySelector(".commentBtn");
    commentBtn.addEventListener("click", () => {
      input.container.style.display = "flex";
      input.container.querySelector("input").focus();
    });
  }
}
