// src/components/Home/Home.js
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebase.js';
import Login from '../Login/Login';
import Register from '../Register/Register';
import './Home.css';

const Home = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="home-container">
            {user ? (
                <>
                    <div className='titles-app'>
                        <h1>Gestor de almacenamiento de información de productos</h1>
                        <h2 className='wellcome-user'>¡Bienvenido, {user.email}!</h2>
                        <h2>En esta app podrás subir información de tus productos, visualizarlos y actualizarlos.</h2>
                        <h3>Próximamente agregaremos diferenciación entre usuarios</h3>
                        <br/>
                        <h2 className="instructions-title">INSTRUCCIONES</h2>
                        <div className='instructions'>
                            <p>Esta aplicación te permite gestionar todos los aspectos relacionados con tus productos de forma eficiente. 
                            El flujo de trabajo es sencillo:</p>

                            <p>1. <strong className="highlight-text">Subir productos</strong>: En la sección de <strong className="highlight-text">Subir Producto</strong>, puedes agregar información detallada de tus productos, 
                            como nombre, descripción, precio y coste. Una vez que se sube el producto, este se almacena en la base de datos.</p>

                            <p>2. <strong className="highlight-text">Visualizar y gestionar productos</strong>: En la sección de <strong className="highlight-text">Productos</strong>, puedes ver una lista completa de los productos 
                            que has subido. Desde aquí, puedes realizar varias acciones:</p>

                            <ul className="instructions-list">
                                <li><strong className="highlight-text">Editar:</strong> Modifica la información del producto si es necesario, como el precio o la descripción.</li>
                                <li><strong className="highlight-text">Eliminar:</strong> Borra un producto de la base de datos si ya no lo necesitas.</li>
                                <li><strong className="highlight-text">Vender:</strong> Registra una venta o una salida de inventario, actualizando el stock disponible.</li>
                            </ul>

                            <p>3. <strong className="highlight-text">Gestión de ventas</strong>: En la sección de <strong className="highlight-text">Ventas</strong>, puedes gestionar la salida de productos. Aquí puedes elegir productos 
                            de tu inventario y registrar cuántas unidades se han vendido. Esta acción ajusta automáticamente el stock disponible.</p>

                            <p>4. <strong className="highlight-text">Estadísticas y reportes</strong>: Finalmente, en la sección de <strong className="highlight-text">Estadísticas</strong>, puedes consultar los reportes de ventas, 
                            revisar el rendimiento de tus productos y obtener información financiera detallada. También puedes filtrar las estadísticas 
                            por fechas para analizar el comportamiento de ventas en periodos específicos.</p>

                            <p>Con estas herramientas, puedes administrar tu inventario de forma eficiente y tener una visión clara de tus operaciones.</p>
                        </div>
                    </div>
                    <img className='background-image updated-image' src="https://i.ibb.co/hFLsT0PX/kiwi-feliz.jpg" alt="imghome" />
                </>
            ) : (
                <div className="auth-section">
                    <Login />
                    <Register />
                </div>
            )}
        </div>
    );
};

export default Home;
