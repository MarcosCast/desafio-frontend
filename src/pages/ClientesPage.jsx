import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import ClienteForm from "../components/ClienteForm";
import { FaTrash, FaSort, FaSortUp, FaSortDown, FaEdit } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import "./ClientesPage.css";

function ClientesPage() {
    const { authData } = useContext(AuthContext);
    const [clients, setClients] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editClient, setEditClient] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });

    const getRandomPastelColor = () => {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 80%)`;
    };

    const getInitials = (name) => {
        return name
            .split(" ")
            .map((word) => word[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    const formatCPF = (cpf) => {
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    };

    const formatTelefone = (numero) => {
        if (numero.length === 11) {
            return numero.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
        }
        return numero.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    };

    const requestSort = (key) => {
        let direction = "ascending";
        if (sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending";
        }
        setSortConfig({ key, direction });
    };

    const getSortedClients = () => {
        if (!sortConfig.key) return clients;

        return [...clients].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === "ascending" ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === "ascending" ? 1 : -1;
            }
            return 0;
        });
    };

    useEffect(() => {
        if (!authData) return;

        const base64 = window.btoa(authData.username + ":" + authData.password);

        fetch(`${import.meta.env.VITE_API_URL}/api/clientes`, {
            headers: {
                Authorization: "Basic " + base64,
            },
        })
            .then((resp) => {
                if (!resp.ok) throw new Error("Erro ao buscar clientes");
                return resp.json();
            })
            .then(setClients)
            .catch((err) => {
                console.error(err);
                showMessage("Erro ao carregar clientes!", "error");
            });
    }, [authData]);

    const handleDelete = async (id) => {
        confirmAlert({
            title: "Confirmação de Exclusão",
            message: "Tem certeza que deseja excluir este cliente?",
            buttons: [
                {
                    label: "Sim",
                    onClick: async () => {
                        try {
                            const base64 = window.btoa(authData.username + ":" + authData.password);
                            const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/clientes/${id}`, {
                                method: "DELETE",
                                headers: { Authorization: "Basic " + base64 },
                            });

                            if (!resp.ok) throw new Error("Erro ao deletar cliente");

                            setClients((prev) => prev.filter((cli) => cli.id !== id));
                            showMessage("Cliente deletado com sucesso!", "success");
                        } catch (error) {
                            console.error(error);
                            showMessage("Erro ao deletar cliente!", "error");
                        }
                    },
                },
                {
                    label: "Não",
                },
            ],
        });
    };

    const handleEdit = (client) => {
        setEditClient(client);
        setShowModal(true);
    };

    const handleCreatedOrUpdated = (updatedClient) => {
        if (editClient) {
            setClients((prev) =>
                prev.map((cli) => (cli.id === updatedClient.id ? updatedClient : cli))
            );
        } else {
            setClients((prev) => [...prev, updatedClient]);
        }

        setEditClient(null);
        setShowModal(false);
    };

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <FaSort className="sort-icon" />;
        return sortConfig.direction === "ascending" ? (
            <FaSortUp className="sort-icon active" />
        ) : (
            <FaSortDown className="sort-icon active" />
        );
    };

    const showMessage = (message, type) => {
        confirmAlert({
            title: type === "success" ? "Sucesso" : "Erro",
            message: message,
            buttons: [
                {
                    label: "OK",
                },
            ],
        });
    };

    return (
        <div className="ClientesPage">
            <header>
                <h2>Clientes</h2>
                {authData.role === "ADMIN" && (
                    <button className="btn-primary" onClick={() => setShowModal(true)}>
                        Criar Cliente
                    </button>
                )}
            </header>

            <div className="table-container">
                <table>
                    <thead>
                    <tr>
                        <th></th>
                        <th onClick={() => requestSort("nome")}>
                            Nome <SortIcon columnKey="nome" />
                        </th>
                        <th onClick={() => requestSort("cpf")}>
                            CPF <SortIcon columnKey="cpf" />
                        </th>
                        <th>Tipo de Telefone</th>
                        <th>Telefone</th>
                        <th>E-mails</th>
                        <th>Endereços</th>
                        {authData.role === "ADMIN" && <th>Ações</th>}
                    </tr>
                    </thead>
                    <tbody>
                    {getSortedClients().map((cli) => (
                        <tr key={cli.id}>
                            <td>
                                <div className="cliente-info">
                                    <div
                                        className="avatar"
                                        style={{ backgroundColor: getRandomPastelColor() }}
                                    >
                                        {getInitials(cli.nome)}
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className="cell-content">{cli.nome}</div>
                            </td>
                            <td>
                                <div className="cell-content">{formatCPF(cli.cpf)}</div>
                            </td>
                            <td>
                                <div className="cell-content multi-line">
                                    {cli.telefones.map((tel) => (
                                        <div key={tel.id}>{tel.tipo}</div>
                                    ))}
                                </div>
                            </td>
                            <td>
                                <div className="cell-content multi-line">
                                    {cli.telefones.map((tel) => (
                                        <div key={tel.id}>{formatTelefone(tel.numero)}</div>
                                    ))}
                                </div>
                            </td>
                            <td>
                                <div className="cell-content multi-line">
                                    {cli.emails.map((em) => (
                                        <div key={em.id}>{em.enderecoEmail}</div>
                                    ))}
                                </div>
                            </td>
                            <td>
                                <div className="cell-content multi-line">
                                    {cli.enderecos.map((end) => (
                                        <div key={end.id}>
                                            {end.logradouro}, {end.bairro}, {end.cidade}-{end.uf}.
                                            CEP: {end.cep}.
                                            {end.complemento && ` Compl: ${end.complemento}`}
                                        </div>
                                    ))}
                                </div>
                            </td>
                            {authData.role === "ADMIN" && (
                                <td>
                                    <button
                                        className="btn-edit"
                                        onClick={() => handleEdit(cli)}
                                        title="Editar cliente"
                                    >
                                        <FaEdit />
                                        <span className="tooltip">Editar</span>
                                    </button>
                                    <button
                                        className="btn-danger"
                                        onClick={() => handleDelete(cli.id)}
                                        title="Deletar cliente"
                                    >
                                        <FaTrash />
                                        <span className="tooltip">Deletar</span>
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <button className="close-modal" onClick={() => setShowModal(false)}>
                            ×
                        </button>
                        <ClienteForm
                            onCreated={handleCreatedOrUpdated}
                            client={editClient}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default ClientesPage;
