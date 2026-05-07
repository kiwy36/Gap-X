import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../services/firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './Navbar.css';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false); // Estado para controlar el menú
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Si el usuario está autenticado, guarda su userId en localStorage
        localStorage.setItem('userId', currentUser.uid);
      }
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      // Cerrar sesión en Firebase
      await signOut(auth);
      
      // Limpiar el estado del usuario y el localStorage
      setUser(null); // Limpia el estado del usuario
      localStorage.removeItem('userId'); // Elimina el userId de localStorage

      // Redirigir al usuario a la página de inicio
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="menu-icon" onClick={toggleMenu}>
        <span className="icon-bar"></span>
        <span className="icon-bar"></span>
        <span className="icon-bar"></span>
      </div>
      <ul className={`navBar ${menuOpen ? 'open' : ''}`}>
        <li><Link to="/" onClick={closeMenu}>Inicio</Link></li>
        {user ? (
          <>
            <li><Link to="/upload" onClick={closeMenu}>Subir Producto</Link></li>
            <li><Link to="/read" onClick={closeMenu}>Productos</Link></li>
            <li><Link to="/store" onClick={closeMenu}>Ventas</Link></li>
            <li><Link to="/statistics" onClick={closeMenu}>Estadísticas</Link></li>
            <li><button onClick={handleLogout} className="logout-button">Cerrar Sesión</button></li>
          </>
        ) : null}
        {menuOpen && (
          <li className="close-menu-mobile" onClick={closeMenu}>Cerrar menú</li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
