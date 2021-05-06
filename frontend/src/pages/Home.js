import View from "../View.js";
import StoryBoard from "../components/StoryBoard.js";
import Form from "../components/Form.js";

/**
 * Home page: login/signup.
 * Components:
 *  {storyBoard} an image
 *  {form} login/signup form
 */
export default class Home extends View {
  constructor(view = "login") {
    super();
    this.container.className = "home_container";
    this.storyBoard = new StoryBoard(view);
    this.form = new Form(view);
    this.storyBoard.mountAt(this.container);
    this.form.mountAt(this.container);
  }
}
