import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BookList from "../../components/BookList";
import { useBooks } from "../../context/BooksContext";
import { useLoans } from "../../context/LoansContext";
import type { Book, CollectionType } from "../../types/books";

export default function CollectionScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const [search, setSearch] = useState("");

  const { libraryBooks, wishlistBooks, deleteBook } = useBooks();
  const { getBorrowedBooks, getLentBooks } = useLoans();

  const borrowedBooks = getBorrowedBooks();
  const lentBooks = getLentBooks();

  const books = useMemo(() => {
    switch (type) {
      case "library":
        return libraryBooks;
      case "wishlist":
        return wishlistBooks;
      case "lent":
        return lentBooks;
      case "borrowed":
        return borrowedBooks;
      default:
        return [];
    }
  }, [type, libraryBooks, wishlistBooks, lentBooks, borrowedBooks]);

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
    );
  }, [books, search]);

  const title = useMemo(() => {
    switch (type) {
      case "library":
        return "My Books";
      case "wishlist":
        return "Wishlist";
      case "lent":
        return "Lent";
      case "borrowed":
        return "Borrowed";
      default:
        return "Collection";
    }
  }, [type]);

  const handleDeleteBook = (book: Book) => {
    if (type === "library" || type === "wishlist") {
      deleteBook(type as CollectionType, book.id);
    }
  };

  const showDelete = type === "library" || type === "wishlist";
  const showAddTile = type === "library" || type === "wishlist";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.screen}>
        <View
          style={[
            styles.header,
            {
              paddingTop: 6,
            },
          ]}
        >
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={34} color="#111" />
          </Pressable>

          <Text style={styles.title}>{title}</Text>

          <View style={styles.iconButton} />
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
          <BookList
            books={filteredBooks}
            isLoading={false}
            showDelete={showDelete}
            onDelete={handleDeleteBook}
            showAddTile={showAddTile}
            addToCollection={
              type === "library" || type === "wishlist"
                ? (type as CollectionType)
                : undefined
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9E9E9",
    borderRadius: 18,
    marginHorizontal: 16,
    paddingHorizontal: 10,
    height: 46,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 16,
    color: "#111",
  },
  listContainer: {
    flex: 1,
  },
});