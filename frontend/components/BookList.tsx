import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { Book } from "../context/BooksContext";
import BookCard from "./BookCard";

type LibraryItem = { type: "add"; id: string } | ({ type: "book" } & Book);

type BookListProps = {
  books: Book[];
  isLoading: boolean;

  showDelete?: boolean;
  showSwap?: boolean;
  showRequest?: boolean;

  onRequest?: (book: Book) => void;
  onDelete?: (book: Book) => void;
  onSwap?: (book: Book) => void;
  addToCollection?: "library" | "wishlist" | "borrowed" | "lent";
  showAddTile?: boolean;
  layout?: "grid" | "carousel";
};

export default function BookList({
  books,
  isLoading,
  showDelete = false,
  showSwap = false,
  showRequest = false,
  onRequest,
  onDelete,
  onSwap,
  showAddTile = false,
  layout = "grid",
}: BookListProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.stateText}>Loading books...</Text>
      </View>
    );
  }

  if (books.length === 0 && !showAddTile) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.stateText}>No books found.</Text>
      </View>
    );
  }

  const data: LibraryItem[] = showAddTile
    ? [
        { type: "add", id: "add-tile" },
        ...books.map((book) => ({ ...book, type: "book" as const })),
      ]
    : books.map((book) => ({ ...book, type: "book" as const }));

  const renderItem = ({ item }: { item: LibraryItem }) => {
    if (item.type === "add") {
      return (
        <Pressable
          style={layout === "carousel" ? styles.carouselAddCard : styles.gridCard}
          onPress={() => router.push("/add-book")}
        >
          <View style={styles.addTile}>
            <Ionicons name="add" size={26} color="#fff" />
          </View>
        </Pressable>
      );
    }

    return (
      <View
        style={layout === "carousel" ? styles.carouselCard : styles.gridCard}
      >
        <BookCard
          book={item}
          showDelete={showDelete}
          showSwap={showSwap}
          showRequest={showRequest}
          onRequest={onRequest}
          onDelete={onDelete}
          onSwap={onSwap}
        />
      </View>
    );
  };

  if (layout === "carousel") {
    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
        renderItem={renderItem}
      />
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.gridContainer}
      showsVerticalScrollIndicator={false}
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    paddingVertical: 10,
  },

  carouselContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  row: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  gridCard: {
    width: "48%",
    marginVertical: 10,
  },

  carouselCard: {
    width: 160,
    height: 220,
    marginRight: 12,
  },

  addTile: {
  width: 56,
  height: 56,
  backgroundColor: "black",
  borderRadius: 28,
  justifyContent: "center",
  alignItems: "center",
  alignSelf: "center",
  marginTop: 80,
  },

  stateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  stateText: {
    marginTop: 12,
    fontSize: 16,
  },

  carouselAddCard: {
  width: 70,
  marginRight: 20,
  justifyContent: "flex-start",
  color: "white",
},
});
