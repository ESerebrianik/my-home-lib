import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import BookList from "../../components/BookList";
import { useBooks, type Book } from "../../context/BooksContext";

type CollectionType = "library" | "wishlist" | "lent" | "borrowed";

export default function CollectionScreen() {
  const { type } = useLocalSearchParams<{ type: CollectionType }>();
  const { libraryBooks, borrowedBooks, lentBooks, wishlistBooks, deleteBook } =
    useBooks();

  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();

  const collectionTitle = useMemo(() => {
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

  const filteredBooks = books.filter((book) => {
    return (
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query)
    );
  });

  const handleDeleteBook = (book: Book) => {
    if (type === "library" || type === "wishlist") {
      deleteBook(type, book.id);
    }
  };

  const showAddButton = type === "library" || type === "wishlist";
  const showDeleteButton = type === "library" || type === "wishlist";

  const handleAddBook = () => {
    router.push({
      pathname: "/add-book",
      params: { collection: type },
    });
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={30} color="#111" />
        </Pressable>
        <Text style={styles.title}>{collectionTitle}</Text>
        <View style={styles.headerRightSpace} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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

        <BookList
          books={filteredBooks}
          isLoading={false}
          showDelete={showDeleteButton}
          onDelete={handleDeleteBook}
          layout="grid"
        />
      </ScrollView>

      {showAddButton && (
        <Pressable style={styles.fab} onPress={handleAddBook}>
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    paddingBottom: 90,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
  },
  backButton: {
    width: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    marginLeft: 8,
  },
  headerRightSpace: {
    width: 36,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9E9E9",
    borderRadius: 18,
    paddingHorizontal: 10,
    height: 38,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 14,
    color: "#111",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#3a24ff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});