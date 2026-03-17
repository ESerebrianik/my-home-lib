import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export type FriendCardProps = {
  id: string;
  name: string;
  avatar: string;
  subtitle?: string;
  onPress?: (id: string) => void;
};

export const FriendCard = ({
  id,
  name,
  avatar,
  subtitle,
  onPress,
}: FriendCardProps) => {
  return (
    <Pressable
      onPress={() => onPress?.(id)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Image source={{ uri: avatar }} style={styles.avatar} />

      <View style={styles.textContainer}>
        <Text style={styles.name}>{name}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    borderRadius: 16,
  },
  pressed: {
    opacity: 0.7,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 20,
    backgroundColor: "#D9D9D9",
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "500",
    color: "#111",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
  },
});