import React, { useState, useEffect } from "react";
import memoize from "lodash/memoize";
import { render } from "@testing-library/react";
import { testNameToKey } from "jest-snapshot/build/utils";

class Demo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
  }

  componentDidMount() {
    this.test();
  }

  increase() {
    this.setState({
      count: this.state.count + 1
    });
  }

  test = () => {
    console.log("object");
  };

  render() {
    return (
      <>
        <p>hello</p>
        <p>{this.state.count}</p>
        <button onClick={() => this.increase()}>Click</button>
      </>
    );
  }
}

export default Demo;
