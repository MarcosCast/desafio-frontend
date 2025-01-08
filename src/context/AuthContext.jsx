import { createContext, useState } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [authData, setAuthData] = useState(() => {
        const stored = localStorage.getItem("authData");
        return stored ? JSON.parse(stored) : null;
    });

    function login(username, password, role) {
        const data = { username, password, role };
        setAuthData(data);
        localStorage.setItem("authData", JSON.stringify(data));
    }

    function logout() {
        setAuthData(null);
        localStorage.removeItem("authData");
    }

    return (
        <AuthContext.Provider value={{ authData, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}