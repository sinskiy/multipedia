import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { getUser } from "../actions/get-user";

export interface User {
  username: string;
  // TODO
}

export const UserContext = createContext<{
  user: User | null;
  updateUser: () => void;
}>({ user: null, updateUser: () => undefined });

export function UserProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<null | User>(null);

  const updateUser = async () => setUser(await getUser());

  useEffect(() => {
    updateUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}