import { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, TextInput } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

import { FriendList } from "../../components/FriendList";
import { useUsers } from "../../context/UsersContext";
import { useLoans } from "../../context/LoansContext";
import { fetchBooksByUser } from "../../api/books";

type FriendCountMap = Record<string, number>;

export default function FriendsScreen() {
  const [search, setSearch] = useState("");
  const [libraryCounts, setLibraryCounts] = useState<FriendCountMap>({});

  const { users, currentUserId } = useUsers();
  const { loans } = useLoans();

  const otherUsers = useMemo(
    () => users.filter((user) => user.id !== currentUserId),
    [users, currentUserId]
  );

  useEffect(() => {
    if (otherUsers.length === 0) return;

    Promise.all(
      otherUsers.map(async (user) => {
        const books = await fetchBooksByUser(user.id, "library");
        return [user.id, books.length] as const;
      })
    )
      .then((results) => {
        const counts = Object.fromEntries(results);
        setLibraryCounts(counts);
      })
      .catch((err) => {
        console.error("FAILED TO FETCH FRIEND LIBRARY COUNTS:", err);
      });
  }, [otherUsers]);

  const friends = useMemo(() => {
    return otherUsers.map((user) => {
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
        const booksCount = libraryCounts[user.id] ?? 0;
        subtitle = `${booksCount} book${booksCount !== 1 ? "s" : ""} in library`;
      }

      return {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        subtitle,
      };
    });
  }, [otherUsers, loans, libraryCounts]);

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

      <FriendList friends={filteredFriends} onFriendPress={handleFriendPress} />
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