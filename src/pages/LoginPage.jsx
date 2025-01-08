import "./LoginPage.css";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

function LoginPage() {
    const { authData, login } = useContext(AuthContext);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    //const API_URL = "/api";
    const API_URL = import.meta.env.VITE_API_URL;

    const role = username === "admin" ? "ADMIN" : "USER";

    async function handleSubmit(e) {
        e.preventDefault();
        setIsLoading(true);

        try {
            const base64 = window.btoa(username + ":" + password);
            const resp = await fetch(`${API_URL}/api/clientes`, {
                method: "GET",
                headers: {
                    Authorization: "Basic " + base64,
                },
            });

            if (!resp.ok) {
                setIsLoading(false);
                showAlert("Credenciais inválidas ou sem permissão!");
                return;
            }

            login(username, password, role);
            setIsLoading(false);
            setTimeout(() => {
                navigate("/clientes");
            }, 3000);
        } catch (error) {
            console.error(error);
            setIsLoading(false);
            showAlert("Erro de rede ou backend indisponível.");
        }
    }

    function showAlert(message, onConfirm) {
        confirmAlert({
            title: "Atenção",
            message: message,
            buttons: [
                {
                    label: "OK",
                    onClick: onConfirm || (() => {}),
                },
            ],
        });
    }

    return (
        <div className="background">
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="login-wrapper">
                <div className="login-container">
                    <h2>Login</h2>
                    {authData ? (
                        <p>Você já está logado como: {authData.username}</p>
                    ) : isLoading ? (
                        <p>Carregando...</p>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label>Usuário:</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    placeholder="Digite seu usuário"
                                />
                            </div>
                            <div>
                                <label>Senha:</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Digite sua senha"
                                />
                            </div>
                            <button type="submit">Entrar</button>
                        </form>
                    )}
                    <footer>
                        Desenvolvido ️por{" "}
                        <a
                            href="https://www.linkedin.com/in/marcos--castro/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Marcos Castro
                        </a>
                    </footer>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
