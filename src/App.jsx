import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import ClientesPage from "./pages/ClientesPage";
import "./App.css";
import { FaSignOutAlt } from "react-icons/fa";

function App() {
    const { authData, logout } = useContext(AuthContext);

    const AuthLayout = ({ children }) => (
        <>
            <header className="auth-header">
                <p>
                    <strong>Bem-vindo,</strong>
                    {authData?.role === "ADMIN"
                        ? "Administrador"
                        : authData?.role === "USER"
                            ? "Usuário"
                            : authData?.username}
                </p>
                <button className="logout-button" onClick={logout} title="Sair">
                    <FaSignOutAlt />
                </button>
            </header>
            <main>{children}</main>
        </>
    );

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        authData ? <Navigate to="/clientes" /> : <Navigate to="/login" />
                    }
                />
                <Route
                    path="/login"
                    element={authData ? <Navigate to="/clientes" /> : <LoginPage />}
                />
                <Route
                    path="/clientes"
                    element={
                        authData ? (
                            <AuthLayout>
                                <ClientesPage />
                            </AuthLayout>
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;