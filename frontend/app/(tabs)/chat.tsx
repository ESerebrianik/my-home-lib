import { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

const chats = [
  {
    id: "1",
    friendId: "1",
    friendName: "John Smith",
    friendAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    lastMessage: "Sure, you can borrow it.",
    updatedAt: "15:20",
  },
  {
    id: "2",
    friendId: "2",
    friendName: "Kevin Brown",
    friendAvatar: "https://randomuser.me/api/portraits/men/45.jpg",
    lastMessage: "Where would be convenient to meet?",
    updatedAt: "Yesterday",
  },
  {
    id: "3",
    friendId: "3",
    friendName: "Anna Pavlova",
    friendAvatar: "https://randomuser.me/api/portraits/women/65.jpg",
    lastMessage: "Hi! Of course.",
    updatedAt: "Monday",
  },
];

export default function ChatScreen() {
  const [search, setSearch] = useState("");

  const filteredChats = useMemo(() => {
    return chats.filter((chat) =>
      chat.friendName.toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [search]);

  const handleOpenChat = (friendId: string) => {
    router.push(`/chat/${friendId}`);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color="#7A7A7A" />
        <TextInput
          placeholder="Search"
          placeholderTextColor="#7A7A7A"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Ionicons
            name="close-circle"
            size={18}
            color="#7A7A7A"
            onPress={() => setSearch("")}
          />
        )}
      </View>

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleOpenChat(item.friendId)}
            style={({ pressed }) => [
              styles.chatCard,
              pressed && styles.chatCardPressed,
            ]}
          >
            <Image source={{ uri: item.friendAvatar }} style={styles.avatar} />

            <View style={styles.chatContent}>
              <View style={styles.chatTopRow}>
                <Text style={styles.friendName}>{item.friendName}</Text>
                <Text style={styles.chatTime}>{item.updatedAt}</Text>
              </View>

              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9E9E9",
    borderRadius: 18,
    paddingHorizontal: 10,
    height: 38,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 14,
    color: "#111",
  },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  chatCardPressed: {
    opacity: 0.7,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    marginRight: 14,
    backgroundColor: "#D9D9D9",
  },
  chatContent: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
    paddingBottom: 12,
  },
  chatTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  friendName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111",
  },
  chatTime: {
    fontSize: 12,
    color: "#888",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
  },
});