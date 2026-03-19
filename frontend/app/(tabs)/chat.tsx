import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useUsers } from "../../context/UsersContext";
import { useMessages } from "../../context/MessagesContext";

export default function ChatScreen() {
  const [search, setSearch] = useState("");

  const { users, currentUserId } = useUsers();
  const { messages } = useMessages();

  const chatItems = useMemo(() => {
    return users
      .filter((user) => user.id !== currentUserId)
      .map((user) => {
        const conversationMessages = messages
          .filter(
            (message) =>
              (message.senderId === currentUserId &&
                message.receiverId === user.id) ||
              (message.senderId === user.id &&
                message.receiverId === currentUserId)
          )
          .sort(
            (a, b) =>
              new Date(a.time).getTime() - new Date(b.time).getTime()
          );

        const lastMessage =
          conversationMessages[conversationMessages.length - 1];

        return {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          lastMessageText: lastMessage?.text || "No messages yet",
          lastMessageTime: lastMessage?.time || "",
          hasMessages: conversationMessages.length > 0,
        };
      })
      .sort((a, b) => {
        if (a.hasMessages && !b.hasMessages) return -1;
        if (!a.hasMessages && b.hasMessages) return 1;

        const aTime = a.lastMessageTime
          ? new Date(a.lastMessageTime).getTime()
          : 0;
        const bTime = b.lastMessageTime
          ? new Date(b.lastMessageTime).getTime()
          : 0;

        return bTime - aTime;
      });
  }, [users, currentUserId, messages]);

  const filteredChats = useMemo(() => {
    const query = search.trim().toLowerCase();

    return chatItems.filter((chat) =>
      chat.name.toLowerCase().includes(query)
    );
  }, [chatItems, search]);

  const formatMessageTime = (value: string) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
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

      <View style={styles.list}>
        {filteredChats.map((chat) => (
          <Pressable
            key={chat.id}
            style={styles.chatRow}
            onPress={() =>
              router.push({
                pathname: "/chat/[id]",
                params: { id: chat.id },
              })
            }
          >
            {chat.avatar ? (
              <Image source={{ uri: chat.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Ionicons name="person" size={22} color="#666" />
              </View>
            )}

            <View style={styles.chatContent}>
              <Text style={styles.chatName}>{chat.name}</Text>
              <Text style={styles.chatPreview} numberOfLines={1}>
                {chat.lastMessageText}
              </Text>
            </View>

            <Text style={styles.chatTime}>
              {formatMessageTime(chat.lastMessageTime)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 12,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9E9E9",
    borderRadius: 18,
    paddingHorizontal: 10,
    height: 38,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 14,
    color: "#111",
  },
  list: {
    paddingHorizontal: 16,
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: "#E9E9E9",
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: "#E9E9E9",
    alignItems: "center",
    justifyContent: "center",
  },
  chatContent: {
    flex: 1,
    marginRight: 8,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  chatPreview: {
    fontSize: 14,
    color: "#666",
  },
  chatTime: {
    fontSize: 13,
    color: "#888",
  },
});