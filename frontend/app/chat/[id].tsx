import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUsers } from "../../context/UsersContext";
import { useLoans } from "../../context/LoansContext";

export default function ChatDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messageText, setMessageText] = useState("");
  const flatListRef = useRef<FlatList<any>>(null);

  const { currentUserId, users } = useUsers();
  const {
    getMessagesForFriend,
    getLoanById,
    getBookById,
    approveLoan,
    declineLoan,
    markReturned,
  } = useLoans();

  const friend = users.find((item) => item.id === id);
  const messages = getMessagesForFriend(id ?? "");

  const scrollToBottom = (animated = true) => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated });
    });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, []);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages.length]);

  const handleSend = () => {
    setMessageText("");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={20}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconButton}
          >
            <Ionicons name="chevron-back" size={30} color="#111" />
          </TouchableOpacity>

          <Text style={styles.title} numberOfLines={1}>
            {friend?.name ?? "Chat"}
          </Text>

          <View style={styles.iconButton} />
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollToBottom(false)}
          renderItem={({ item }) => {
            const loan = getLoanById(item.loanId);
            const book = getBookById(item.bookId);

            const isSystem = item.sender === "system";
            const isMe = item.sender === "me";
            const isOwnerOfBook = loan?.ownerId === currentUserId;
            const isBorrower = loan?.borrowerId === currentUserId;

            return (
              <View
                style={[
                  styles.messageWrapper,
                  isSystem
                    ? styles.messageWrapperSystem
                    : isMe
                    ? styles.messageWrapperMe
                    : styles.messageWrapperFriend,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isSystem
                      ? styles.systemMessage
                      : isMe
                      ? styles.myMessage
                      : styles.friendMessage,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isMe && !isSystem && styles.myMessageText,
                    ]}
                  >
                    {item.text}
                  </Text>

                  {book && (
                    <View style={styles.bookCard}>
                      <Image
                        source={{ uri: book.cover || "" }}
                        style={styles.bookCover}
                      />
                      <View style={styles.bookInfo}>
                        <Text style={styles.bookTitle} numberOfLines={2}>
                          {book.title}
                        </Text>
                        <Text style={styles.bookAuthor} numberOfLines={1}>
                          {book.author}
                        </Text>

                        {loan && (
                          <Text style={styles.loanStatus}>
                            Status: {loan.status}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}

                  {loan?.status === "requested" && isOwnerOfBook && (
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={styles.approveButton}
                        onPress={() => approveLoan(loan.id)}
                      >
                        <Text style={styles.actionText}>Approve</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.declineButton}
                        onPress={() => declineLoan(loan.id)}
                      >
                        <Text style={styles.actionText}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {loan?.status === "borrowed" && isBorrower && (
                    <TouchableOpacity
                      style={styles.returnButton}
                      onPress={() => markReturned(loan.id)}
                    >
                      <Text style={styles.actionText}>Mark as returned</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />

        <SafeAreaView edges={["bottom"]} style={styles.inputArea}>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Type a message..."
              placeholderTextColor="#7A7A7A"
              style={styles.input}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
    backgroundColor: "#fff",
  },
  iconButton: {
    width: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginHorizontal: 8,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  messageWrapper: {
    marginBottom: 12,
    flexDirection: "row",
  },
  messageWrapperMe: {
    justifyContent: "flex-end",
  },
  messageWrapperFriend: {
    justifyContent: "flex-start",
  },
  messageWrapperSystem: {
    justifyContent: "center",
  },
  messageBubble: {
    maxWidth: "82%",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  myMessage: {
    backgroundColor: "#3a24ff",
  },
  friendMessage: {
    backgroundColor: "#EFEFEF",
  },
  systemMessage: {
    backgroundColor: "#F7F7F7",
  },
  messageText: {
    fontSize: 15,
    color: "#111",
    lineHeight: 20,
  },
  myMessageText: {
    color: "#fff",
  },
  bookCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 10,
    padding: 8,
    alignItems: "center",
  },
  bookCover: {
    width: 42,
    height: 60,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: "#D9D9D9",
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 12,
    color: "#666",
  },
  loanStatus: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#3a24ff",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  approveButton: {
    backgroundColor: "#3a24ff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  declineButton: {
    backgroundColor: "#888",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  returnButton: {
    backgroundColor: "#3a24ff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  actionText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  inputArea: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: "#EFEFEF",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 48,
    maxHeight: 110,
    fontSize: 16,
    color: "#111",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3a24ff",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
});