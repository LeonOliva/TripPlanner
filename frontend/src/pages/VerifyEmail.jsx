import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VerifyMessage from '../components/VerifyMessage';

// CORRETTO
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    
    const [status, setStatus] = useState('Stiamo verificando la tua email...');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const verifyAccount = async () => {
            try {
                // CORRETTO: `${API_URL}/...` senza http e con backticks
                const res = await fetch(`${API_URL}/api/auth/verify-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });
                const data = await res.json();

                if (data.success) {
                    setIsSuccess(true);
                    setStatus('✅ Email verificata con successo! Reindirizzamento al login...');
                    setTimeout(() => navigate('/login'), 3000);
                } else {
                    setIsError(true);
                    setStatus(data.message || 'Link non valido o scaduto.');
                }
            } catch (error) {
                console.error(error);
                setIsError(true);
                setStatus('Errore di connessione al server.');
            }
        };

        if (token) {
            verifyAccount();
        } else {
            setIsError(true);
            setStatus("Token mancante.");
        }
    }, [token, navigate]);

    return (
        <VerifyMessage status={status} isSuccess={isSuccess} isError={isError} />
    );
};

export default VerifyEmail;