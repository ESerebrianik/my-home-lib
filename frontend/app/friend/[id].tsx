import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import BookList from "../../components/BookList";
import { useUsers } from "../../context/UsersContext";
import { useLoans } from "../../context/LoansContext";
import { fetchBooksByUser } from "../../api/books";
import { mapApiBookToBook } from "../../mappers/mapApiBookToBook";

import type { Book } from "../../types/books";

export default function FriendLibraryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [search, setSearch] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { users } = useUsers();
  const { requestBook } = useLoans();

  const friend = users.find((item) => item.id === id);

  useEffect(() => {
    if (!id) return;

    setIsLoading(true);

    fetchBooksByUser(id, "library")
      .then((data) => {
        setBooks(data.map(mapApiBookToBook));
      })
      .catch((err) => {
        console.error("FAILED TO FETCH FRIEND LIBRARY:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
    );
  }, [books, search]);

  const handleRequestBook = async (book: Book) => {
    if (!id) return;

    try {
      await requestBook({
        bookId: book.id,
        ownerId: id,
      });

      router.push({
        pathname: "/chat/[id]",
        params: { id },
      });
    } catch (err) {
      console.error("FAILED TO REQUEST BOOK:", err);
    }
  };

  const handleOpenMessage = () => {
    setMenuVisible(false);

    router.push({
      pathname: "/chat/[id]",
      params: { id: id ?? "" },
    });
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="chevron-back" size={32} color="#111" />
        </TouchableOpacity>

        <Text style={styles.title} numberOfLines={1}>
          {friend ? `${friend.name}'s library` : "Friend's library"}
        </Text>

        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.iconButton}
        >
          <Ionicons name="menu" size={30} color="#111" />
        </TouchableOpacity>
      </View>

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

      <View style={styles.listContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <BookList
            books={filteredBooks}
            isLoading={false}
            showRequest
            onRequest={handleRequestBook}
          />
        )}
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem} onPress={handleOpenMessage}>
              <Text style={styles.menuText}>Message</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  iconButton: {
    width: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    marginHorizontal: 8,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9E9E9",
    borderRadius: 18,
    marginHorizontal: 16,
    paddingHorizontal: 10,
    height: 38,
    marginBottom: 8,
    marginTop: 8,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 14,
    color: "#111",
  },
  listContainer: {
    flex: 1,
  },
  loadingContainer: {
    paddingTop: 40,
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  menu: {
    position: "absolute",
    top: 90,
    right: 16,
    width: 140,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 16,
    color: "#111",
  },
});