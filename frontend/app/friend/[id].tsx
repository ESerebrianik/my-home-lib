import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import BookList from "../../components/BookList";
import { useUsers } from "../../context/UsersContext";
import { useMessages } from "../../context/MessagesContext";
import { useLoans } from "../../context/LoansContext";
import { fetchBooksByUser } from "../../api/books";
import { fetchLoans } from "../../api/loans";
import { mapApiBookToBook } from "../../mappers/mapApiBookToBook";

import type { Book } from "../../types/books";
import type { Loan } from "../../types/loans";

type ApiLoan = {
  loan_id: string | number;
  book_id: string | number;
  owner_id: string | number;
  borrower_id: string | number;
  status: string;
  requested_at?: string;
  approved_at?: string;
  returned_at?: string;
  title?: string;
  author?: string;
  genre?: string;
  year?: number | string;
  cover_url?: string;
  description?: string;
  availability_status?: string;
};

export default function FriendLibraryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [search, setSearch] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [libraryBooks, setLibraryBooks] = useState<Book[]>([]);
  const [wishlistBooks, setWishlistBooks] = useState<Book[]>([]);
  const [friendLoans, setFriendLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { users } = useUsers();
  const { requestBook } = useLoans();
  const { sendMessage, refreshMessagesForFriend } = useMessages();

  const friend = users.find((item) => item.id === id);

  useEffect(() => {
    if (!id) return;

    const loadFriendData = async () => {
      try {
        setIsLoading(true);

        const [libraryData, wishlistData, loansData] = await Promise.all([
          fetchBooksByUser(id, "library"),
          fetchBooksByUser(id, "wishlist"),
          fetchLoans(id),
        ]);

        setLibraryBooks(libraryData.map(mapApiBookToBook));
        setWishlistBooks(wishlistData.map(mapApiBookToBook));

        const mappedLoans: Loan[] = (loansData as ApiLoan[]).map((loan) => ({
          id: String(loan.loan_id),
          bookId: String(loan.book_id),
          ownerId: String(loan.owner_id),
          borrowerId: String(loan.borrower_id),
          status: loan.status as Loan["status"],
          requestedAt: loan.requested_at || "",
          approvedAt: loan.approved_at || undefined,
          returnedAt: loan.returned_at || undefined,
          book: loan.title
            ? {
                id: String(loan.book_id),
                title: loan.title,
                author: loan.author || "",
                genre: loan.genre || "Unknown",
                year:
                  typeof loan.year === "number"
                    ? loan.year
                    : Number(loan.year) || new Date().getFullYear(),
                cover: loan.cover_url?.replace("http://", "https://") || "",
                description: loan.description || "",
                ownerId: String(loan.owner_id),
                status:
                  (loan.availability_status as Book["status"]) || "available",
              }
            : undefined,
        }));

        setFriendLoans(mappedLoans);
      } catch (err) {
        console.error("FAILED TO FETCH FRIEND LIBRARY:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadFriendData();
  }, [id]);

  const query = search.trim().toLowerCase();

  const filterBooks = (books: Book[]) =>
    books.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
    );

  const availableLibraryBooks = useMemo(
    () => filterBooks(libraryBooks.filter((book) => book.status === "available")),
    [libraryBooks, query]
  );

  const filteredWishlistBooks = useMemo(
    () => filterBooks(wishlistBooks),
    [wishlistBooks, query]
  );

  const friendLentBooks = useMemo(() => {
    const lent = friendLoans
      .filter((loan) => loan.ownerId === id && loan.status === "borrowed")
      .map((loan) => loan.book)
      .filter(Boolean) as Book[];

    return filterBooks(lent);
  }, [friendLoans, id, query]);

  const friendBorrowedBooks = useMemo(() => {
    const borrowed = friendLoans
      .filter((loan) => loan.borrowerId === id && loan.status === "borrowed")
      .map((loan) => loan.book)
      .filter(Boolean) as Book[];

    return filterBooks(borrowed);
  }, [friendLoans, id, query]);

  const handleRequestBook = async (book: Book) => {
    if (!id) return;

    try {
      const createdLoan = await requestBook({
        bookId: book.id,
        ownerId: id,
      });

      if (createdLoan) {
        await sendMessage({
          receiverId: id,
          text: `Hi, can I borrow "${book.title}" from you?`,
          loanId: createdLoan.id,
          bookId: book.id,
        });

        await refreshMessagesForFriend(id);
      }

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
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
        >
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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Books</Text>
          </View>
          <BookList
            books={availableLibraryBooks}
            isLoading={false}
            showRequest
            onRequest={handleRequestBook}
            layout="carousel"
          />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Wishlist</Text>
          </View>
          <BookList
            books={filteredWishlistBooks}
            isLoading={false}
            layout="carousel"
          />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lent</Text>
          </View>
          <BookList
            books={friendLentBooks}
            isLoading={false}
            layout="carousel"
          />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Borrowed</Text>
          </View>
          <BookList
            books={friendBorrowedBooks}
            isLoading={false}
            layout="carousel"
          />
        </ScrollView>
      )}

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleOpenMessage}
            >
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
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