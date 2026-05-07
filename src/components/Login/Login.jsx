/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { auth, signInWithEmailAndPassword } from '../../services/firebase.js';
import Swal from 'sweetalert2';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);

  // Función para validar formato de correo electrónico
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Validaciones antes de llamar a Firebase
    if (!validateEmail(email)) {
      setError('Por favor, ingresa un correo electrónico válido');
      return;
    }

    if (password.trim() === '') {
      setError('Por favor, ingresa tu contraseña');
      return;
    }

    setError(''); // Limpia mensajes de error

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      setUserId(user.uid);
      localStorage.setItem('userId', user.uid);

      Swal.fire({
        title: "¡Bienvenido!",
        text: "Usuario autenticado exitosamente",
        icon: "success"
      });
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);

      switch (error.code) {
        case 'auth/user-not-found':
          setError('Usuario no encontrado. Verifique que el correo electrónico sea correcto');
          break;
        case 'auth/wrong-password':
          setError('Contraseña incorrecta. Verifique su contraseña e intente de nuevo');
          break;
        case 'auth/invalid-email':
          setError('El formato de correo electrónico no es válido');
          break;
        case 'auth/invalid-credential':
          setError('Las credenciales ingresadas son incorrectas. Verifique correo y contraseña');
          break;
        case 'auth/too-many-requests':
          setError('Demasiados intentos fallidos. Por favor, espere e intente nuevamente');
          break;
        default:
          setError('Error en el inicio de sesión. Verifique su correo y contraseña.');
          break;
      }
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        className="input-field"
      />
      <input 
        type="password" 
        placeholder="Contraseña" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        className="input-field"
      />
      {error && <p className="error-message">{error}</p>}
      <button onClick={handleLogin} className="login-button">Iniciar Sesión</button>
    </div>
  );
};

export default Login;
