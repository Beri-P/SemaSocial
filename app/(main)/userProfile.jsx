// app/(main)/userProfile.jsx
import React from "react";
import Profile from "../tabs/profile";
import { useLocalSearchParams } from "expo-router";

const UserProfile = () => {
  const { userId } = useLocalSearchParams();

  return <Profile userId={userId} />;
};

export default UserProfile;
