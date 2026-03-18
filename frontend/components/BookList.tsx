import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { Book, CollectionType } from "../types/books";
import BookCard from "./BookCard";

type BookListProps = {
  books: Book[];
  isLoading: boolean;
  showDelete?: boolean;
  showSwap?: boolean;
  showRequest?: boolean;
  onRequest?: (book: Book) => void;
  onDelete?: (book: Book) => void;
  onSwap?: (book: Book) => void;
  addToCollection?: CollectionType;
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
  addToCollection,
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

  const handleAddPress = () => {
    if (addToCollection) {
      router.push({
        pathname: "/add-book",
        params: { collection: addToCollection },
      });
      return;
    }

    router.push("/add-book");
  };

  const renderAddTile = () => (
    <Pressable
      key="add-tile"
      style={layout === "carousel" ? styles.carouselAddCard : styles.gridCard}
      onPress={handleAddPress}
    >
      <View style={styles.addTile}>
        <Ionicons name="add" size={26} color="#fff" />
      </View>
    </Pressable>
  );

  const renderBookCard = (book: Book) => (
    <View
      key={book.id}
      style={layout === "carousel" ? styles.carouselCard : styles.gridCard}
    >
      <BookCard
        book={book}
        showDelete={showDelete}
        showSwap={showSwap}
        showRequest={showRequest}
        onRequest={onRequest}
        onDelete={onDelete}
        onSwap={onSwap}
      />
    </View>
  );

  if (layout === "carousel") {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContent}
      >
        {showAddTile && renderAddTile()}
        {books.map(renderBookCard)}
      </ScrollView>
    );
  }

  return (
    <View style={styles.gridContainer}>
      <View style={styles.gridRow}>
        {showAddTile ? renderAddTile() : null}
        {books.map(renderBookCard)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },

  gridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  carouselContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  gridCard: {
    width: "48%",
    marginVertical: 10,
  },

  carouselCard: {
    width: 160,
    marginRight: 12,
  },

  addTile: {
    width: 56,
    height: 56,
    backgroundColor: "#000",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 80,
  },

  carouselAddCard: {
    width: 70,
    marginRight: 20,
    justifyContent: "flex-start",
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
    color: "#111",
  },
});