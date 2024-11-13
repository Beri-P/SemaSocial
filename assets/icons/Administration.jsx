import * as React from "react";
import Svg, { Path } from "react-native-svg";

const Administration = (props) => (
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
      d="M20 22.0002V17.0002C20 15.1146 20 14.1718 19.4142 13.586C18.8284 13.0002 17.8856 13.0002 16 13.0002L12 22.0002L8 13.0002C6.11438 13.0002 5.17157 13.0002 4.58579 13.586C4 14.1718 4 15.1146 4 17.0002V22.0002"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 15L11.5 19L12 20.5L12.5 19L12 15ZM12 15L11 13H13L12 15Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15.5 6.50012V5.50012C15.5 3.56713 13.933 2.00012 12 2.00012C10.067 2.00012 8.5 3.56713 8.5 5.50012V6.50012C8.5 8.43312 10.067 10.0001 12 10.0001C13.933 10.0001 15.5 8.43312 15.5 6.50012Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default Administration;
