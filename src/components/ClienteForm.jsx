import React, { useState, useEffect } from "react";
import InputMask from "react-input-mask";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

function ClienteForm({ onCreated, client }) {
    const [nome, setNome] = useState(client?.nome || "");
    const [cpf, setCpf] = useState(client?.cpf || "");
    const [telefones, setTelefones] = useState(client?.telefones || [{ tipo: "celular", numero: "" }]);
    const [emails, setEmails] = useState(client?.emails.map((e) => e.enderecoEmail) || [""]);
    const [cep, setCep] = useState(client?.enderecos?.[0]?.cep || "");
    const [logradouro, setLogradouro] = useState(client?.enderecos?.[0]?.logradouro || "");
    const [bairro, setBairro] = useState(client?.enderecos?.[0]?.bairro || "");
    const [cidade, setCidade] = useState(client?.enderecos?.[0]?.cidade || "");
    const [uf, setUf] = useState(client?.enderecos?.[0]?.uf || "");
    const [complemento, setComplemento] = useState(client?.enderecos?.[0]?.complemento || "");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (client) {
            setNome(client.nome);
            setCpf(client.cpf);
            setTelefones(client.telefones || [{ tipo: "celular", numero: "" }]);
            setEmails(client.emails.map((e) => e.enderecoEmail) || [""]);
            setCep(client.enderecos?.[0]?.cep || "");
            setLogradouro(client.enderecos?.[0]?.logradouro || "");
            setBairro(client.enderecos?.[0]?.bairro || "");
            setCidade(client.enderecos?.[0]?.cidade || "");
            setUf(client.enderecos?.[0]?.uf || "");
            setComplemento(client.enderecos?.[0]?.complemento || "");
        }
    }, [client]);

    const getTelefoneMask = (tipo) => (tipo === "celular" ? "(99) 99999-9999" : "(99) 9999-9999");

    async function handleCepChange(e) {
        const cepValue = e.target.value.replace(/\D/g, "");
        setCep(cepValue);

        if (cepValue.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setLogradouro(data.logradouro || "");
                    setBairro(data.bairro || "");
                    setCidade(data.localidade || "");
                    setUf(data.uf || "");
                } else {
                    showError("CEP inválido.");
                }
            } catch (error) {
                console.error("Erro ao buscar endereço:", error);
                showError("Erro ao buscar endereço.");
            }
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!nome || !cpf || !cep || !logradouro || !bairro || !cidade || !uf) {
            setErrorMessage("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        const payload = {
            id: client?.id,
            nome,
            cpf: cpf.replace(/\D/g, ""),
            telefones: telefones.map((tel) => ({
                tipo: tel.tipo,
                numero: tel.numero.replace(/\D/g, ""),
            })),
            emails: emails.map((email) => ({ enderecoEmail: email })),
            enderecos: [
                {
                    cep,
                    logradouro,
                    bairro,
                    cidade,
                    uf,
                    complemento,
                },
            ],
        };

        try {
            const url = client
                ? `${import.meta.env.VITE_API_URL}/api/clientes/${client.id}`
                : `${import.meta.env.VITE_API_URL}/api/clientes`;
            const method = client ? "PUT" : "POST";
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Basic YWRtaW46MTIzcXdlIUAj",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                console.error("Erro do servidor:", error);
                throw new Error("Erro ao salvar cliente.");
            }

            const updatedClient = await response.json();
            onCreated(updatedClient);
        } catch (error) {
            console.error("Erro na requisição:", error);
            showError("Erro ao salvar cliente.");
        }
    }

    const addTelefone = () => setTelefones([...telefones, { tipo: "celular", numero: "" }]);
    const updateTelefone = (index, field, value) => {
        const updated = [...telefones];
        updated[index][field] = value;
        setTelefones(updated);
    };
    const removeTelefone = (index) => setTelefones(telefones.filter((_, i) => i !== index));

    const addEmail = () => setEmails([...emails, ""]);
    const updateEmail = (index, value) => {
        const updated = [...emails];
        updated[index] = value;
        setEmails(updated);
    };
    const removeEmail = (index) => setEmails(emails.filter((_, i) => i !== index));

    const showError = (message) => {
        confirmAlert({
            title: "Erro",
            message: message,
            buttons: [
                {
                    label: "OK",
                },
            ],
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>{client ? "Editar Cliente" : "Criar Cliente"}</h3>
            <div>
                <label>
                    Nome: <span style={{ color: "red" }}>*</span>
                </label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div>
                <label>
                    CPF: <span style={{ color: "red" }}>*</span>
                </label>
                <InputMask mask="999.999.999-99" value={cpf} onChange={(e) => setCpf(e.target.value)} required />
            </div>
            {telefones.map((tel, index) => (
                <div key={index}>
                    <label>Telefone Tipo:</label>
                    <select value={tel.tipo} onChange={(e) => updateTelefone(index, "tipo", e.target.value)}>
                        <option value="celular">Celular</option>
                        <option value="residencial">Residencial</option>
                        <option value="comercial">Comercial</option>
                    </select>
                    <InputMask
                        mask={getTelefoneMask(tel.tipo)}
                        value={tel.numero}
                        onChange={(e) => updateTelefone(index, "numero", e.target.value)}
                        required
                    />
                    <button type="button" onClick={() => removeTelefone(index)}>
                        Remover
                    </button>
                </div>
            ))}
            <button type="button" onClick={addTelefone}>
                Adicionar Telefone
            </button>
            {emails.map((email, index) => (
                <div key={index}>
                    <label>E-mail:</label>
                    <input type="email" value={email} onChange={(e) => updateEmail(index, e.target.value)} required />
                    <button type="button" onClick={() => removeEmail(index)}>
                        Remover
                    </button>
                </div>
            ))}
            <button type="button" onClick={addEmail}>
                Adicionar E-mail
            </button>
            <div>
                <label>
                    CEP: <span style={{ color: "red" }}>*</span>
                </label>
                <InputMask mask="99999-999" value={cep} onChange={handleCepChange} required />
            </div>
            <div>
                <label>
                    Logradouro: <span style={{ color: "red" }}>*</span>
                </label>
                <input type="text" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} required />
            </div>
            <div>
                <label>
                    Bairro: <span style={{ color: "red" }}>*</span>
                </label>
                <input type="text" value={bairro} onChange={(e) => setBairro(e.target.value)} required />
            </div>
            <div>
                <label>
                    Cidade: <span style={{ color: "red" }}>*</span>
                </label>
                <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} required />
            </div>
            <div>
                <label>
                    UF: <span style={{ color: "red" }}>*</span>
                </label>
                <input type="text" value={uf} onChange={(e) => setUf(e.target.value)} maxLength="2" required />
            </div>
            <div>
                <label>Complemento:</label>
                <input type="text" value={complemento} onChange={(e) => setComplemento(e.target.value)} />
            </div>
            <button type="submit">Salvar</button>
            <p style={{ color: "red", marginTop: "10px", fontSize: "0.9rem" }}>
                * Campos obrigatórios
            </p>
            {errorMessage && <p style={{ color: "red", marginTop: "10px" }}>{errorMessage}</p>}
        </form>
    );
}

export default ClienteForm;
