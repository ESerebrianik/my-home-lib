import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { Book } from "../context/BooksContext";

type BookCardProps = {
  book: Book;
  showDelete?: boolean;
  showSwap?: boolean;
  showRequest?: boolean;
  onRequest?: (book: Book) => void;
  onDelete?: (book: Book) => void;
  onSwap?: (book: Book) => void;
};

export default function BookCard({
  book,
  showDelete = false,
  showSwap = false,
  showRequest = false,
  onRequest,
  onDelete,
  onSwap,
}: BookCardProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const hasCover = !!book.cover?.trim();

  const handleRequest = () => {
    onRequest?.(book);
    setModalVisible(false);
  };

  const handleDelete = () => {
    onDelete?.(book);
    setModalVisible(false);
  };

  const handleSwap = () => {
    onSwap?.(book);
    setModalVisible(false);
  };

  return (
    <>
      <Pressable style={styles.card} onPress={() => setModalVisible(true)}>
        {hasCover ? (
          <Image source={{ uri: book.cover }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.fallbackCover]}>
            <Text style={styles.fallbackTitle} numberOfLines={4}>
              {book.title}
            </Text>
          </View>
        )}
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>✕</Text>
            </Pressable>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.title}>{book.title}</Text>
              <Text style={styles.author}>{book.author}</Text>

              {hasCover ? (
                <Image source={{ uri: book.cover }} style={styles.modalImage} />
              ) : (
                <View style={[styles.modalImage, styles.fallbackCover]}>
                  <Text style={styles.modalFallbackTitle} numberOfLines={5}>
                    {book.title}
                  </Text>
                </View>
              )}

              <View style={styles.iconRow}>
                {showSwap && (
                  <Pressable onPress={handleSwap}>
                    <Ionicons
                      name="swap-horizontal-outline"
                      size={28}
                      color="black"
                    />
                  </Pressable>
                )}

                {showDelete && (
                  <Pressable onPress={handleDelete}>
                    <Ionicons name="trash-outline" size={28} color="black" />
                  </Pressable>
                )}

                {showRequest && (
                  <Pressable onPress={handleRequest}>
                    <Ionicons
                      name="arrow-redo-outline"
                      size={28}
                      color="black"
                    />
                  </Pressable>
                )}
              </View>

              <Text style={styles.meta}>
                {book.genre} • {book.year}
              </Text>

              <Text style={styles.description}>{book.description}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 220,
    borderRadius: 8,
},

  fallbackCover: {
    backgroundColor: "#4a4a4a",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 16,
  },

  fallbackTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 24,
  },

  modalFallbackTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 30,
    paddingHorizontal: 12,
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  modalCard: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    maxHeight: "80%",
  },

  closeButton: {
    position: "absolute",
    right: 15,
    top: 15,
    zIndex: 10,
  },

  closeText: {
    fontSize: 22,
    fontWeight: "bold",
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
    paddingTop: 10,
  },

  author: {
    textAlign: "center",
    color: "#666",
    marginBottom: 10,
  },

  modalImage: {
    width: "50%",
    height: 220,
    borderRadius: 10,
    marginVertical: 10,
    alignSelf: "center",
  },

  meta: {
    textAlign: "center",
    fontSize: 14,
    color: "#888",
    marginBottom: 10,
  },

  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },

  iconRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
    marginVertical: 10,
  },
});
