import * as React from "react";
import Svg, { Path, Circle } from "react-native-svg";

const Architectural = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={24}
    height={24}
    color="#000000"
    fill="none"
    {...props}
  >
    <Path
      d="M10 10L5 22M14 10L19 22"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 4L12 2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
    <Path
      d="M3 13C4.99073 16.0242 8.27968 18 12 18C15.7203 18 19.0093 16.0242 21 13"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Path
      d="M12 17V19"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default Architectural;
