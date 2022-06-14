class ReactClone {
  static render(mainElement, componentTree) {
    const component = new componentTree();
    component.parent = mainElement;
    component.renderHtml();
  }
}

class Component {
  constructor(props = {}) {
    this.props = props;
  }

  render() {
    throw Error("You must override the render method in a component.");
  }

  renderHtml(parent = this.parent) {
    const html = this.render();
    if (!Array.isArray(html)) {
      throw new Error(
        "Components render function must return an array of html elements"
      );
    }
    for (let element of html) {
      if (element instanceof Component) {
        element.parent = parent;
        element.renderHtml();
      } else {
        if (element?.when !== undefined && !element.when) continue;

        const addedEle = this.makeHTMLComponent(element, this.parent);
        if (element.children) {
          this.renderChildren(element.children, addedEle);
        }
      }
    }
  }

  renderChildren(children, parent) {
    if (!Array.isArray(children)) {
      throw new Error("html children must be in an array");
    }

    for (let ele of children) {
      if (ele instanceof Component) {
        ele.parent = parent;
        ele.renderHtml();
      } else {
        if (ele.when !== undefined && !ele.when) continue;

        const html = this.makeHTMLComponent(ele, parent);
        if (ele.children) {
          this.renderChildren(ele.children, html);
        }
        parent.append(html);
      }
    }
  }

  setState(cb) {
    if (!this.state) {
      throw new Error(
        "setState is only callable within components with state."
      );
    }
    const returnedState = cb(this.state);
    if (this.state === returnedState) return;

    this.reRender();
  }

  getProps() {
    const properties = {};
    for (let key of this) {
      properties[key] = this[key];
    }

    return properties;
  }

  makeHTMLComponent(ele, parent) {
    const htmlEle = document.createElement(ele.type);

    if (ele.body) {
      //check and see if innerText works better later, worst case we can use innerHTMLL
      htmlEle.textContent = ele.body;
    }
    if (ele.style) {
      for (let key in ele.style) {
        htmlEle.style[key] = ele.style[key];
      }
    }

    if (ele.events) {
      for (let key in ele.events) {
        htmlEle[key] = ele.events[key];
      }
    }
    parent.append(htmlEle);
    return htmlEle;
  }

  reRender() {
    while (this.parent.firstChild) {
      this.parent.removeChild(this.parent.firstChild);
    }
    this.renderHtml();
  }
}

class TestChildComponent extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return [
      { type: "p", body: "I was rendered, Yippy! :D" },
      {
        type: "div",
        style: {
          display: "flex",
          justifyContent: "space-around",
        },
        children: [
          {
            type: "div",
            body: "flex 1",
            when: this.props.clicked > 4,
            children: [
              { type: "div", body: "flex 1" },
              { type: "div", body: "flex 2" },
              { type: "div", body: "flex 3" },
            ],
          },
          {
            type: "div",
            body: "flex 2",
            when: this.props.clicked > 5,
            children: [
              { type: "div", body: "flex 1" },
              { type: "div", body: "flex 2" },
              { type: "div", body: "flex 3" },
            ],
          },
          {
            type: "div",
            body: "flex 3",
            when: this.props.clicked > 6,
            children: [
              { type: "div", body: "flex 1" },
              { type: "div", body: "flex 2" },
              { type: "div", body: "flex 3" },
            ],
          },
        ],
      },
    ];
  }
}

class PropsComponent extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return [
      {
        type: "div",
        when: this.props.clicked > 0,
        children: [
          {
            type: "h1",
            body: `component has been rendered: ${this.props.clicked} times`,
            style: {
              color: "red",
            },
          },
        ],
      },
      new TestChildComponent({ clicked: this.props.clicked }),
    ];
  }
}

class MyComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      clicked: 0,
    };
  }

  render() {
    return [
      {
        type: "div",
        style: {
          display: "flex",
        },
        children: [
          {
            type: "button",
            body: `click to re-render`,
            events: {
              onclick: () => this.setState((prev) => prev.clicked++),
            },
          },
          {
            type: "button",
            body: "click to subtract rendering",
            events: {
              onclick: () => this.setState((prev) => prev.clicked--),
            },
          },
        ],
      },
      new PropsComponent({ clicked: this.state.clicked }),
    ];
  }
}

const mainElement = document.getElementById("root");

ReactClone.render(mainElement, MyComponent);
