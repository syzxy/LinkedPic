import View from "../View.js";
import ContentCard from "../components/ContentCard.js";

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * The page where posts of following users are displayed.
 * Infinit scroll implemented.
 * @param {string} token auth token of current logged in user
 */
export default class Feed extends View {
  constructor(token) {
    super();
    this.container.className = "feed_container";
    this.seq = 0;
    this.limit = 10;
    this.endOfPost = false;
    // load initial posts
    this.loadFeed(token);

    // loading bar
    const loading = document.createElement("div");
    const loadingBar = document.createElement("div");
    loading.className = "loading";
    loadingBar.className = "loading_bar";
    loading.appendChild(loadingBar);
    this.container.appendChild(loading);

    // infinite scroll
    // scroll debounce
    // https://stackoverflow.com/questions/34822077/scroll-function-firing-multiple-times-instead-of-once
    let triggerScroll = true;
    document.querySelector("main").addEventListener("scroll", (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      if (
        scrollTop + clientHeight >= scrollHeight &&
        !this.endOfPost &&
        triggerScroll
      ) {
        triggerScroll = false;
        this.seq += this.limit;
        loading.style.display = "initial";
        sleep(600)
          .then(() => (loading.style.display = "none"))
          .then(() => this.loadFeed(token))
          .then(() => (triggerScroll = true));
      }
    });
  }
}

/**
 * Load `limit` posts starting from `seq` from the server.
 * @param {string} token user auth token
 * @param {string} seq api parameter, the next post to load
 * @param {string} limit api parameter, the number of posts loaded per fetch
 * @returns {promise}
 */
Feed.prototype.loadFeed = function (token, seq = this.seq, limit = this.limit) {
  return fetch(`http://127.0.0.1:5000/user/feed?p=${seq}&n=${limit}`, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      const posts = data.posts;
      if (posts.length) {
        posts.forEach((post) => {
          const card = new ContentCard(post);
          card.mountAt(this.container);
        });
      } else if (this.seq > 0) {
        this.container.appendChild(
          document.createTextNode("no more posts to show")
        );
        this.endOfPost = true;
      } else {
        this.container.appendChild(
          document.createTextNode(
            "Oh no no, you are not following anyone, try to make some fake friends"
          )
        );
        this.endOfPost = true;
      }
    });
};
