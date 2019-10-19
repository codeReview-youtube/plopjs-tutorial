import style from "./Button.style.scss";

import React, { Component } from "react";

/**
 * Button
 */
export default class Button extends Component {
  /**
   * Render
   */
  render() {
    const { content } = this.props;

    return <p className={style.element}>{content}</p>;
  }
}
