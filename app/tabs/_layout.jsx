// /app/tabs/_layout.jsx
import { Tabs } from "expo-router";
import Icon from "../../assets/icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          // Map route names to your icon names (correct case)
          if (route.name === "home") {
            iconName = "home";
          } else if (route.name === "people") {
            iconName = "users";
          } else if (route.name === "shorts") {
            iconName = "video";
          } else if (route.name === "jobs") {
            iconName = "job";
          } else if (route.name === "profile") {
            iconName = "user";
          }

          // Return the icon component
          return (
            <Icon
              name={iconName}
              size={size} // Use the size from the tabBarIcon props
              strokeWidth={2}
              color={color} // Set the color based on focused state
            />
          );
        },
        tabBarActiveTintColor: "#2f95dc",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tabs.Screen
        name="home"
        options={{ title: "Home", headerShown: false }}
      />
      <Tabs.Screen
        name="people"
        options={{ title: "People", headerShown: false }}
      />
      <Tabs.Screen name="shorts" options={{ title: "Shorts" }} />
      <Tabs.Screen
        name="jobs"
        options={{ title: "Jobs", headerShown: false }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", headerShown: false }}
      />
    </Tabs>
  );
}
