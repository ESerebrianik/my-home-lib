import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useState } from "react";
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

export default function Library() {
  const { libraryBooks, borrowedBooks, lentBooks, wishlistBooks, deleteBook } =
    useBooks();
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();

  const availableBooks = libraryBooks.filter((book) => {
    return (
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query)
    );
  });

  const filteredLentBooks = lentBooks.filter((book) => {
    return (
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query)
    );
  });

  const filteredBorrowedBooks = borrowedBooks.filter((book) => {
    return (
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query)
    );
  });

  const filteredWishlistBooks = wishlistBooks.filter((book) => {
    return (
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query)
    );
  });

  const handleDeleteBook = (book: Book) => {
    deleteBook("library", book.id);
  };

  return (
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

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Books</Text>
        <Pressable onPress={() => router.push("/collection/library")}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>
      <BookList
        books={availableBooks}
        isLoading={false}
        showDelete
        onDelete={handleDeleteBook}
        layout="carousel"
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Wishlist</Text>
        <Pressable onPress={() => router.push("/collection/wishlist")}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>
      <BookList
        books={filteredWishlistBooks}
        isLoading={false}
        showDelete
        onDelete={handleDeleteBook}
        layout="carousel"
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Lent</Text>
        <Pressable onPress={() => router.push("/collection/lent")}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>
      <BookList books={filteredLentBooks} isLoading={false} layout="carousel" />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Borrowed</Text>
        <Pressable onPress={() => router.push("/collection/borrowed")}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>
      <BookList
        books={filteredBorrowedBooks}
        isLoading={false}
        layout="carousel"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    paddingBottom: 24,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9E9E9",
    borderRadius: 18,
    paddingHorizontal: 10,
    height: 38,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 14,
    color: "#111",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3a24ff",
  },
});