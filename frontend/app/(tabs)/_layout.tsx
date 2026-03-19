import Ionicons from "@expo/vector-icons/Ionicons";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { Tabs } from "expo-router";
import { useUsers } from "../../context/UsersContext";
import UserAvatar from "../../components/UserAvatar";
import { useState } from "react";
import { View, Modal, Pressable, Text, StyleSheet } from "react-native";

export default function TabLayout() {
  const { users, currentUser, setCurrentUserId } = useUsers();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#111",
          headerLeft: () => <DrawerToggleButton />,
          headerShadowVisible: false,
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              {currentUser ? (
                <UserAvatar
                  avatar={currentUser.avatar}
                  onPress={() => setModalVisible(true)}
                />
              ) : (
                <Pressable
                  onPress={() => setModalVisible(true)}
                  style={styles.fallbackAvatar}
                >
                  <Ionicons name="person" size={18} color="#111" />
                </Pressable>
              )}
            </View>
          ),
        }}
      >
        <Tabs.Screen
          name="library"
          options={{
            title: "Library",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "library-sharp" : "library-outline"}
                color={color}
                size={24}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="friends"
          options={{
            title: "Friends",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "people-sharp" : "people-outline"}
                color={color}
                size={24}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="chat"
          options={{
            title: "Chat",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "chatbubbles-sharp" : "chatbubbles-outline"}
                color={color}
                size={24}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="wishlist"
          options={{
            title: "Wishlist",
            href: null,
          }}
        />

        <Tabs.Screen
          name="borrowed"
          options={{
            title: "Borrowed",
            href: null,
          }}
        />

        <Tabs.Screen
          name="lent"
          options={{
            title: "Lent",
            href: null,
          }}
        />
      </Tabs>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <View style={styles.menu}>
            {users.map((user) => (
              <Pressable
                key={user.id}
                onPress={() => {
                  setCurrentUserId(user.id);
                  setModalVisible(false);
                }}
                style={styles.menuItem}
              >
                <Text style={styles.menuText}>{user.name}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fallbackAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E9E9E9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  menu: {
    position: "absolute",
    top: 80,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    minWidth: 160,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  menuText: {
    fontSize: 16,
    color: "#111",
  },

  headerRightContainer: {
    marginRight: 6,
  },
});