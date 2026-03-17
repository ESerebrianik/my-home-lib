import { Image, Pressable, StyleSheet } from "react-native";

type Props = {
  avatar: string;
  onPress: () => void;
};

export default function UserAvatar({ avatar, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Image source={{ uri: avatar }} style={styles.avatar} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
});