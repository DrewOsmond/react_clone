import { Component } from "./componentClass";

class ReactClone {
  /**
   *
   * @param rootElement A node element that represents the root in which we will build our components tree.
   * @param componentTree the top root node of or component tree which will render instide of our root node
   */
  static render(rootElement: HTMLElement, componentTree: Component) {
    console.log(rootElement, componentTree);
  }
}

export default ReactClone;
