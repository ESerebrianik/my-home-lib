import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { useBooks } from "../context/BooksContext";

export default function UserSwitcher() {
  const { users, currentUserId, setCurrentUserId } = useBooks();

  return (
    <View style={styles.container}>
      {users.map((user) => {
        const active = currentUserId === user.id;

        return (
          <TouchableOpacity
            key={user.id}
            style={[styles.userButton, active && styles.userButtonActive]}
            onPress={() => setCurrentUserId(user.id)}
          >
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <Text style={[styles.userText, active && styles.userTextActive]}>
              {user.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  userButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "#EFEFEF",
  },
  userButtonActive: {
    backgroundColor: "#3a24ff",
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 8,
  },
  userText: {
    color: "#111",
    fontWeight: "600",
    fontSize: 14,
  },
  userTextActive: {
    color: "#fff",
  },
});