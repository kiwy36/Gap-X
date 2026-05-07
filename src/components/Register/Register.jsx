import { useState } from 'react'; // Hook para manejar el estado local
import { db, auth, createUserWithEmailAndPassword } from '../../services/firebase.js'; // Importa la autenticación de Firebase
import { doc, setDoc } from 'firebase/firestore';
import './Register.css';
import Swal from 'sweetalert2'; // Librería para mostrar alertas

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
  };
  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(password);
  };

  const handleRegister = async () => {
    if (!validateEmail(email)) {
        setError('Por favor, ingresa un correo electrónico válido');
        return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!validatePassword(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, incluyendo letras y números');
      return;
    }

    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Almacena datos adicionales del usuario en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: new Date().toISOString(),
      });
      // Almacena datos adicionales del usuario en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: new Date().toISOString(),
      });

      // Crear subcolecciones para el usuario
      await setDoc(doc(db, 'users', user.uid, 'Versiones', 'version vigente'), {
        version: 1
      });

      // Crear las subcolecciones vacías (puedes agregar más lógica si es necesario)
      await setDoc(doc(db, 'users', user.uid, 'Productos', 'exampleProductId'), {
        // Puedes dejarlo vacío o agregar un objeto inicial
      });

      await setDoc(doc(db, 'users', user.uid, 'UserCategories', 'Todas las Categorias'), {
        name: 'Gestionar categorias'
      });

      await setDoc(doc(db, 'users', user.uid, 'Ventas', 'exampleSaleId'), {
        // Puedes dejarlo vacío o agregar un objeto inicial
      });
      Swal.fire({
        title: "¡Buen trabajo!",
        text: "Usuario registrado exitosamente",
        icon: "success"
      });
    } catch (error) {
      console.error('Error en el registro:', error);
      setError('Error en el registro: ' + error.message);
    }
  };

  return (
    <div className="register-container">
      <h2>Registrar</h2>
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
      <input
        type="password"
        placeholder="Repetir Contraseña"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="input-field"
      />
      {error && <p className="error-message">{error}</p>}
      <button onClick={handleRegister} className="register-button">Registrar</button>
    </div>
  );
};

export default Register;
