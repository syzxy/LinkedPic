/**
 * A basic view ADT that has a container
 *
 * methods:
 *  mountAt: render the component inside the given parent node
 *  assemble: mount all child components to the element self
 */

export default class View {
  constructor() {
    this.container = document.createElement("div");
    this.children = [];
  }
}

View.prototype.mountAt = function (parentNode) {
  parentNode.appendChild(this.container);
};

View.prototype.assemble = function () {
  this.children.forEach((child) => {
    if (child instanceof View) {
      child.mountAt(this.container);
    } else {
      this.container.appendChild(child);
    }
  });
};

// View.prototype.unmountFrom = function (parentNode) {
//   parentNode.removeChild(this.container);
// };
