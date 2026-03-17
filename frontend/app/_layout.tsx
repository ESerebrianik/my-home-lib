import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import CustomDrawerContent from "../components/CustomDrawerContent";
import { BooksProvider } from "../context/BooksContext";

export default function RootLayout() {
  return (
    <BooksProvider>
      <StatusBar style="dark" />
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            title: "My library",
          }}
        />

        <Drawer.Screen
          name="add-book"
          options={{
            title: "Add a book",
          }}
        />

        <Drawer.Screen
          name="friend/[id]"
          options={{
            drawerItemStyle: { display: "none" },
            title: "Friend Details",
          }}
        />

        <Drawer.Screen
          name="chat/[id]"
          options={{
            drawerItemStyle: { display: "none" },
            title: "Chat Details",
          }}
        />

        <Drawer.Screen
          name="+not-found"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />
      </Drawer>
    </BooksProvider>
  );
}
