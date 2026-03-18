import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import CustomDrawerContent from "../components/CustomDrawerContent";
import { UsersProvider } from "../context/UsersContext";
import { BooksProvider } from "../context/BooksContext";
import { LoansProvider } from "../context/LoansContext";

export default function RootLayout() {
  return (
    <UsersProvider>
      <BooksProvider>
        <LoansProvider>
          <StatusBar style="dark" />
          <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{ headerShown: false }}
          />
        </LoansProvider>
      </BooksProvider>
    </UsersProvider>
  );
}