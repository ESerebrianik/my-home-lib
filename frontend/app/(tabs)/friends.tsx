import { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { FriendList } from "../../components/FriendList";
import { useBooks } from "../../context/BooksContext";

export default function FriendsScreen() {
  const [search, setSearch] = useState("");
  const { users, currentUserId, books, loans } = useBooks();

  const friends = useMemo(() => {
    return users
      .filter((user) => user.id !== currentUserId)
      .map((user) => {
        const lentCount = loans.filter(
          (loan) => loan.ownerId === user.id && loan.status === "borrowed"
        ).length;

        const borrowedCount = loans.filter(
          (loan) => loan.borrowerId === user.id && loan.status === "borrowed"
        ).length;

        let subtitle = "";

        if (lentCount > 0) {
          subtitle = `${lentCount} book${lentCount > 1 ? "s" : ""} lent`;
        } else if (borrowedCount > 0) {
          subtitle = `${borrowedCount} book${borrowedCount > 1 ? "s" : ""} borrowed`;
        } else {
          const booksCount = books.filter((book) => book.ownerId === user.id).length;
          subtitle = `${booksCount} book${booksCount !== 1 ? "s" : ""} in library`;
        }

        return {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          subtitle,
        };
      });
  }, [users, currentUserId, books, loans]);

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const handleFriendPress = (id: string) => {
    router.push({
      pathname: "/friend/[id]",
      params: { id },
    });
  };

  return (
    <View style={styles.screen}>
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

      <FriendList
        friends={filteredFriends}
        onFriendPress={handleFriendPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 8,
    paddingBottom: 12,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9E9E9",
    borderRadius: 18,
    marginHorizontal: 16,
    paddingHorizontal: 10,
    height: 38,
    marginTop: 8,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 14,
    color: "#111",
  },
});