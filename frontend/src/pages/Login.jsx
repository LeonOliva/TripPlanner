import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginHeader from '../components/LoginHeader';
import LoginForm from '../components/LoginForm';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Inserisci email e password per continuare.");
      return;
    }

    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Errore durante il login");
      }

      console.log("Login riuscito:", data);
      
      localStorage.setItem('accessToken', data.accessToken);
      
      if (onLogin) onLogin();

      // alert("Login effettuato con successo!"); // Opzionale, spesso è meglio reindirizzare subito
      navigate('/dashboard'); 

    } catch (err) {
      console.error("Errore login:", err);
      setError(err.message);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        
        {/* HEADER */}
        <LoginHeader />

        {/* FORM & AZIONI */}
        <LoginForm 
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            handleGoogleLogin={handleGoogleLogin}
            error={error}
        />

      </div>
    </div>
  );
};

export default Login;