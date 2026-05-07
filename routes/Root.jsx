import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth } from '../src/services/firebase'
import Home from '../src/components/Home/Home';
import Footer from '../src/components/Footer/Footer';
import Navbar from '../src/components/Navbar/Navbar';
import UploadProduct from '../src/components/UploadProduct/UploadProduct';
import ReadProducts from '../src/components/ReadProducts/ReadProducts';
import Register from '../src/components/Register/Register';
import Login from '../src/components/Login/Login';
import Store from '../src/components/Store/Store';
import Statistics from '../src/components/Statistics/Statistics';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Root.css';

function Root() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user); // Establece el usuario autenticado
            } else {
                setUser(null); // Sin usuario autenticado
            }
        });

        return () => unsubscribe(); // Limpieza de la suscripción
    }, []);

    return (
      <Router>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<UploadProduct user={user} />} /> {/* Pasa el user aquí */}
            <Route path="/read" element={<ReadProducts user={user}/>} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/store" element={<Store user={user}/>} />
            <Route path="/statistics" element={<Statistics user={user} />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    );
}

export default Root;
