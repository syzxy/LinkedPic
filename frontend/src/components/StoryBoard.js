import View from "../View.js";

/**
 * Image view on login/signup page
 * Hidden on small screens
 */
export default class StoryBoard extends View {
  constructor(view) {
    super();
    this.container.className = "storyBoard";
    const image = document.createElement("img");
    image.className = "image_home";
    image.src = `./assets/${view}.jpg`;
    image.alt = "";
    this.container.appendChild(image);
  }
}
