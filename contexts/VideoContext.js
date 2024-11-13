import React, { createContext, useContext, useState } from "react";

const VideoContext = createContext();

export const VideoProvider = ({ children }) => {
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [isVideoPaused, setIsVideoPaused] = useState(true);

  const playVideo = (videoId) => {
    if (activeVideoId !== videoId) {
      setActiveVideoId(videoId);
      setIsVideoPaused(false);
    }
  };

  const pauseVideo = () => {
    setActiveVideoId(null);
    setIsVideoPaused(true);
  };

  return (
    <VideoContext.Provider
      value={{ activeVideoId, isVideoPaused, playVideo, pauseVideo }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error("useVideo must be used within a VideoProvider");
  }
  return context;
};
