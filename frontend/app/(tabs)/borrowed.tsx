import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Alert, StyleSheet, TextInput, View } from "react-native";
import BookList from "../../components/BookList";
import { useLoans } from "../../context/LoansContext";
import type { Book } from "../../types/books";

export default function BorrowedScreen() {
  const { getBorrowedBooks } = useLoans();
  const [search, setSearch] = useState("");

  const borrowedBooks = getBorrowedBooks();

  const filteredBooks = borrowedBooks.filter((book) => {
    const query = search.trim().toLowerCase();

    return (
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query)
    );
  });

  const handleLendBook = (book: Book) => {
    Alert.alert("Borrowed book", `You selected "${book.title}".`);
  };

  return (
    <View style={styles.container}>
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
        showSwap
        onSwap={handleLendBook}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
});