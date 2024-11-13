//icons/index.jsx
import React from "react";
import Home from "./Home";
import Mail from "./Mail";
import Lock from "./Lock";
import User from "./User";
import Heart from "./Heart";
import Plus from "./Plus";
import Search from "./Search";
import Location from "./Location";
import Call from "./Call";
import { theme } from "../../constants/theme";
import Camera from "./Camera";
import Edit from "./Edit";
import ArrowLeft from "./ArrowLeft";
import ThreeDotsCircle from "./ThreeDotsCircle";
import ThreeDotsHorizontal from "./ThreeDotsHorizontal";
import Comment from "./Comment";
import Share from "./Share";
import Send from "./Send";
import Delete from "./Delete";
import Logout from "./logout";
import Image from "./Image";
import Video from "./Video";
import Users from "./Users";
import Job from "./Job";
import Notification from "./Notification";
import Accounting from "./Accounting";
import Administration from "./Administration";
import Agriculture from "./Agriculture";
import Architectural from "./Architectural";
import Audit from "./Audit";
import Automotive from "./Automotive";
import Engineering from "./Engineering";
import Hospitality from "./Hospitality";
import Media from "./Media";
import Programming from "./Programming";
import Company from "./Company";
import Experience from "./Experience";

const icons = {
  home: Home,
  mail: Mail,
  lock: Lock,
  user: User,
  heart: Heart,
  plus: Plus,
  search: Search,
  location: Location,
  call: Call,
  camera: Camera,
  edit: Edit,
  arrowLeft: ArrowLeft,
  threeDotsCircle: ThreeDotsCircle,
  threeDotsHorizontal: ThreeDotsHorizontal,
  comment: Comment,
  share: Share,
  send: Send,
  delete: Delete,
  logout: Logout,
  image: Image,
  video: Video,
  users: Users,
  job: Job,
  notification: Notification,
  accounting: Accounting,
  administration: Administration,
  agriculture: Agriculture,
  architectural: Architectural,
  audit: Audit,
  automotive: Automotive,
  engineering: Engineering,
  hospitality: Hospitality,
  media: Media,
  programming: Programming,
  company: Company,
  experience: Experience,
};

const Icon = ({ name, ...props }) => {
  const IconComponent = icons[name];
  return (
    <IconComponent
      height={props.size || 24}
      width={props.size || 24}
      strokeWidth={props.strokeWidth || 1.9}
      color={theme.colors.textLight}
      {...props}
    />
  );
};

export default Icon;
