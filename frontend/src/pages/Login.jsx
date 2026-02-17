import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginHeader from '../components/LoginHeader';
import LoginForm from '../components/LoginForm';

// 1. DEFINIAMO L'URL DEL BACKEND
const API_URL = import.meta.env.VITE_API_URL || "https://tripplanner-tvpl.onrender.com";

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Inserisci email e password per continuare.");
      return;
    }
    setError('');

    try {
      // 2. USA API_URL INVECE DI LOCALHOST NELLA FETCH
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Errore durante il login");

      console.log("Login riuscito:", data);
      localStorage.setItem('accessToken', data.accessToken);
      if (onLogin) onLogin();
      navigate('/dashboard'); 

    } catch (err) {
      console.error("Errore login:", err);
      setError(err.message);
    }
  };

  const handleGoogleLogin = () => {
    // 3. USA API_URL ANCHE PER GOOGLE
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <LoginHeader />
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