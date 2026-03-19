import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
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
import { useBooks } from "../../context/BooksContext";
import { useLoans } from "../../context/LoansContext";
import type { Book } from "../../types/books";

export default function Library() {
  const { libraryBooks, wishlistBooks, deleteBook } = useBooks();
  const { getBorrowedBooks, getLentBooks } = useLoans();

  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();

  const borrowedBooks = getBorrowedBooks();
  const lentBooks = getLentBooks();

  const filterBooks = (books: Book[]) =>
    books.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
    );

  const availableBooks = useMemo(
    () => filterBooks(libraryBooks),
    [libraryBooks, query]
  );

  const filteredWishlistBooks = useMemo(
    () => filterBooks(wishlistBooks),
    [wishlistBooks, query]
  );

  const filteredLentBooks = useMemo(
    () => filterBooks(lentBooks),
    [lentBooks, query]
  );

  const filteredBorrowedBooks = useMemo(
    () => filterBooks(borrowedBooks),
    [borrowedBooks, query]
  );

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

      
      <Pressable
        style={styles.sectionHeader}
        onPress={() => router.push("/collection/library")}
      >
        <Text style={styles.sectionTitle}>My Books</Text>
        <Ionicons name="chevron-forward" size={34} color="#111" />
      </Pressable>
      
      <BookList
        books={availableBooks}
        isLoading={false}
        showDelete
        onDelete={handleDeleteBook}
        layout="carousel"
      />

      <Pressable
        style={styles.sectionHeader}
        onPress={() => router.push("/collection/wishlist")}
      >
        <Text style={styles.sectionTitle}>Wishlist</Text>
        <Ionicons name="chevron-forward" size={34} color="#111" />
      </Pressable>

      <BookList
        books={filteredWishlistBooks}
        isLoading={false}
        showDelete
        onDelete={handleDeleteBook}
        layout="carousel"
      />

      <Pressable
        style={styles.sectionHeader}
        onPress={() => router.push("/collection/lent")}
      >
        <Text style={styles.sectionTitle}>Lent</Text>
        <Ionicons name="chevron-forward" size={34} color="#111" />
      </Pressable>
      <BookList books={filteredLentBooks} isLoading={false} layout="carousel" />

      
      <Pressable
        style={styles.sectionHeader}
        onPress={() => router.push("/collection/borrowed")}
      >
        <Text style={styles.sectionTitle}>Borrowed</Text>
        <Ionicons name="chevron-forward" size={34} color="#111" />
      </Pressable>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 4,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    marginRight: 6,
  }, 
});