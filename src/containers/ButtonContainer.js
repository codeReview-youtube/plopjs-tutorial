
import React, { Component } from "react";
import { connect } from "react-redux";

/**
* Button
*/
class Button extends Component {
/**
* Render
*/
render() {
const { content } = this.props;

return (
<p>{content}</p>
  );
  }
  }

  const mapStateToProps = (state: *) => ({})
  const mapDispatchToProps = (state: *) => ({})

  export default connect(mapStateToProps, mapDispatchToProps)(Button)