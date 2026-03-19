import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CoverCamera from "../components/CoverCamera";
import ISBNScanner from "../components/ISBNScanner";
import { useBooks } from "../context/BooksContext";
import type { CollectionType } from "../types/books";

type GoogleBookItem = {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    categories?: string[];
    publishedDate?: string;
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    industryIdentifiers?: {
      type?: string;
      identifier?: string;
    }[];
  };
};

export default function AddBookScreen() {
  const { addBook } = useBooks();
  const params = useLocalSearchParams<{ collection?: string }>();

  const collectionParam = params.collection;

  const targetCollection: CollectionType =
    collectionParam === "wishlist" ||
    collectionParam === "borrowed" ||
    collectionParam === "lent" ||
    collectionParam === "library"
      ? collectionParam
      : "library";

  const [showCamera, setShowCamera] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [cover, setCover] = useState("");
  const [description, setDescription] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GoogleBookItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Защита от многократной обработки одного и того же скана
  const isHandlingScanRef = useRef(false);

  const screenTitle =
    targetCollection === "library"
      ? "Add Book to My Books"
      : targetCollection === "wishlist"
      ? "Add Book to Wishlist"
      : targetCollection === "lent"
      ? "Add Book to Lent"
      : "Add Book to Borrowed";

  const saveButtonLabel =
    targetCollection === "library"
      ? "Save to My Books"
      : targetCollection === "wishlist"
      ? "Save to Wishlist"
      : targetCollection === "lent"
      ? "Save to Lent"
      : "Save to Borrowed";

  const resetForm = () => {
    setTitle("");
    setAuthor("");
    setGenre("");
    setYear("");
    setCover("");
    setDescription("");
    setSearchQuery("");
    setSearchResults([]);
    setShowCamera(false);
    setShowScanner(false);
    isHandlingScanRef.current = false;
  };

  const autofillForm = (book: GoogleBookItem) => {
    const info = book.volumeInfo;

    if (!info) return;

    setTitle(info.title || "");
    setAuthor(info.authors?.join(", ") || "");
    setGenre(info.categories?.[0] || "");
    setDescription(info.description || "");
    setCover(
      info.imageLinks?.thumbnail?.replace("http://", "https://") ||
        info.imageLinks?.smallThumbnail?.replace("http://", "https://") ||
        ""
    );

    const publishedDate = info.publishedDate || "";
    const parsedYear = publishedDate.slice(0, 4);
    setYear(/^\d{4}$/.test(parsedYear) ? parsedYear : "");

    setSearchResults([]);
    setSearchQuery(info.title || "");
  };

  const searchGoogleBooks = async (query: string) => {
    const trimmed = query.trim();

    if (!trimmed) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);

      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
          trimmed
        )}&maxResults=10`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }

      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (error) {
      console.error("Google Books search error:", error);
      Alert.alert("Search failed", "Could not fetch books right now.");
    } finally {
      setIsSearching(false);
    }
  };

  const searchByISBN = async (isbn: string) => {
  try {
    setIsSearching(true);

    const cleanISBN = isbn.replace(/[^0-9Xx]/g, "");

    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(
        cleanISBN
      )}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch ISBN result");
    }

    const data = await response.json();
    const firstMatch = data.items?.[0];

    if (!firstMatch) {
      Alert.alert(
        "No match found",
        `No Google Books result found for ISBN ${cleanISBN}.`
      );
      return;
    }

    autofillForm(firstMatch);
  } catch (error) {
    console.error("ISBN search error:", error);
    Alert.alert("Lookup failed", "Could not fetch book data from ISBN.");
  } finally {
    setIsSearching(false);
    setShowScanner(false);
  }
};

  /**
   * Главное изменение:
   * обрабатываем scan только один раз,
   * даже если камера успела несколько раз подряд прислать один и тот же ISBN
   */
  const handleScanned = async (isbn: string) => {
    if (isHandlingScanRef.current) return;

    isHandlingScanRef.current = true;

    try {
      await searchByISBN(isbn);
    } finally {
      // Сбрасываем блокировку только после закрытия сканера
      setTimeout(() => {
        isHandlingScanRef.current = false;
      }, 300);
    }
  };

  const handleAddBook = async () => {
    if (!title.trim() || !author.trim()) {
      Alert.alert(
        "Missing information",
        "Please enter at least a title and author."
      );
      return;
    }

    try {
      await addBook(targetCollection, {
        title: title.trim(),
        author: author.trim(),
        genre: genre.trim() || "Unknown",
        year: Number(year) || new Date().getFullYear(),
        cover: cover.trim(),
        description: description.trim() || "No description provided.",
      });

      resetForm();
      router.back();
    } catch (error) {
      console.error("FAILED TO ADD BOOK:", error);
      Alert.alert("Save failed", "Could not save the book right now.");
    }
  };

  if (showCamera) {
    return (
      <CoverCamera
        onCapture={(uri) => {
          setCover(uri);
          setShowCamera(false);
        }}
        onCancel={() => setShowCamera(false)}
      />
    );
  }

  if (showScanner) {
    return (
      <ISBNScanner
        onScanned={handleScanned}
        onCancel={() => {
          isHandlingScanRef.current = false;
          setShowScanner(false);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconButton}
          >
            <Ionicons name="chevron-back" size={30} color="#111" />
          </TouchableOpacity>

          <Text style={styles.heading}>{screenTitle}</Text>
        </View>

        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={18} color="#7A7A7A" />

          <TextInput
            placeholder={isSearching ? "Searching..." : "Search by title"}
            placeholderTextColor="#7A7A7A"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => searchGoogleBooks(searchQuery)}
            returnKeyType="search"
          />

          {searchQuery.length > 0 && (
            <Ionicons
              name="close-circle"
              size={18}
              color="#7A7A7A"
              onPress={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
            />
          )}
        </View>

        <Pressable
          style={styles.scanButton}
          onPress={() => {
            isHandlingScanRef.current = false;
            setShowScanner(true);
          }}
        >
          <Text style={styles.scanButtonText}>Scan Barcode</Text>
        </Pressable>

        {searchResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const info = item.volumeInfo;

                return (
                  <Pressable
                    style={styles.resultCard}
                    onPress={() => autofillForm(item)}
                  >
                    <Text style={styles.resultTitle}>
                      {info?.title || "Untitled"}
                    </Text>
                    <Text style={styles.resultAuthor}>
                      {info?.authors?.join(", ") || "Unknown author"}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Book title"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={styles.input}
          placeholder="Author"
          value={author}
          onChangeText={setAuthor}
        />

        <TextInput
          style={styles.input}
          placeholder="Genre"
          value={genre}
          onChangeText={setGenre}
        />

        <TextInput
          style={styles.input}
          placeholder="Year"
          value={year}
          onChangeText={setYear}
          keyboardType="numeric"
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TextInput
          style={styles.input}
          placeholder="Cover image URL"
          value={cover}
          onChangeText={setCover}
        />

        {cover.trim() ? (
          <Image source={{ uri: cover }} style={styles.coverPreview} />
        ) : (
          <View style={styles.fallbackCover}>
            <Text style={styles.fallbackTitle}>
              {title.trim() || "Book Title"}
            </Text>
          </View>
        )}

        <Pressable
          style={styles.cameraButton}
          onPress={() => setShowCamera(true)}
        >
          <Text style={styles.cameraButtonText}>Take cover photo</Text>
        </Pressable>

        <Pressable style={styles.saveButton} onPress={handleAddBook}>
          <Text style={styles.saveButtonText}>{saveButtonLabel}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  screen: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconButton: {
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  heading: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9E9E9",
    borderRadius: 18,
    paddingHorizontal: 10,
    height: 42,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 14,
    color: "#111",
  },
  scanButton: {
    backgroundColor: "#3a24ff",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  scanButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  resultsContainer: {
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  resultTitle: {
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 4,
    color: "#111",
  },
  resultAuthor: {
    color: "#666",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    color: "#111",
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  coverPreview: {
    width: 140,
    height: 200,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 16,
  },
  fallbackCover: {
    width: 140,
    height: 200,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 16,
    backgroundColor: "#4a4a4a",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  fallbackTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  cameraButton: {
    backgroundColor: "#e5e5e5",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  cameraButtonText: {
    fontWeight: "600",
    color: "#111",
  },
  saveButton: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});