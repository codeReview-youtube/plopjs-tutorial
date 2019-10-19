import React from "react";
import { shallow } from "enzyme";

import Button from "./index";

// My way in testing with Jest &Enzyme

describe("Button", () => {
  const wrapper = shallow(<Button />);

  it("Should match its snapshot", () => {
    expect(wrapper).toMatchSnapshot();
  });
});
