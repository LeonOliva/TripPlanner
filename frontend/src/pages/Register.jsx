import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import RegisterHeader from '../components/RegisterHeader';
import RegisterForm from '../components/RegisterForm';

const API_URL = import.meta.env.VITE_API_URL || "https://tripplanner-tvpl.onrender.com";

const Register = () => {
  const navigate = useNavigate(); 
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    if (formData.password !== formData.confirmPassword) {
      setError("Le password non coincidono!");
      return;
    }
    
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Errore durante la registrazione");
      }

      alert("Registrazione completata! 📩\n\nTi abbiamo inviato una email per verificare il tuo account.\nControlla la posta (e lo spam) e clicca sul link per attivare il profilo.");
      
      navigate('/login'); 

    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleRegister = () => {
  window.location.href = `${API_URL}/api/auth/google`;
};

  return (
    <div className="auth-container">
      <div className="auth-card">
        
        {/* HEADER */}
        <RegisterHeader />

        {/* FORM & LOGICA */}
        <RegisterForm 
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            handleGoogleRegister={handleGoogleRegister}
            error={error}
        />

      </div>
    </div>
  );
};

export default Register;