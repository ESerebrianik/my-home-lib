import { FlatList, StyleSheet } from "react-native";
import { FriendCard } from "./FriendCard";

export type Friend = {
  id: string;
  name: string;
  subtitle?: string;
  avatar: string;
};

type FriendListProps = {
  friends: Friend[];
  onFriendPress?: (id: string) => void;
};

export const FriendList = ({ friends, onFriendPress }: FriendListProps) => {
  return (
    <FlatList
      data={friends}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <FriendCard
          id={item.id}
          name={item.name}
          subtitle={item.subtitle}
          avatar={item.avatar}
          onPress={onFriendPress}
        />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 24,
    paddingHorizontal: 16
  },
});