import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchUsers } from "../api/users";
import type { User } from "../types/users";
import { mapApiUserToUser } from "../mappers/mapApiUserToUser";

type UsersContextType = {
  users: User[];
  currentUserId: string;
  currentUser: User | undefined;
  setCurrentUserId: (userId: string) => void;
};

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    fetchUsers()
      .then((data) => {
        const mappedUsers: User[] = data.map(mapApiUserToUser);
        setUsers(mappedUsers);

        if (mappedUsers.length > 0) {
          setCurrentUserId(mappedUsers[0].id);
        }
      })
      .catch((err) => {
        console.error("FAILED TO FETCH USERS:", err);
      });
  }, []);

  const currentUser = users.find((user) => user.id === currentUserId);

  const value = useMemo(
    () => ({
      users,
      currentUserId,
      currentUser,
      setCurrentUserId,
    }),
    [users, currentUserId, currentUser]
  );

  return (
    <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UsersContext);

  if (!context) {
    throw new Error("useUsers must be used within a UsersProvider");
  }

  return context;
}