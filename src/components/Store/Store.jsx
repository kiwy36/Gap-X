import { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore'; // Importar funciones necesarias para manejar Firestore
import { db } from '../../services/firebase'; // Importar la instancia de Firebase
import Swal from 'sweetalert2'; // Importar SweetAlert para notificaciones
import './Store.css'; // Importar estilos CSS específicos para este componente
import PropTypes from 'prop-types';

const VERSION_ID = 'version vigente'; // ID estático de la versión que se usa para actualizar en Firestore

const Store = ({ user }) => {
    // Estados locales para manejar los productos del carrito y totales
    const [cartProducts, setCartProducts] = useState([]); // Productos en el carrito
    const [totalQuantity, setTotalQuantity] = useState(0); // Cantidad total de productos vendidos
    const [totalMoney, setTotalMoney] = useState(0); // Total de ingresos generados
    const [totalCost, setTotalCost] = useState(0); // Total de coste de los productos vendidos
    const [isButtonDisabled, setIsButtonDisabled] = useState(false); // Estado para deshabilitar el botón

    // useEffect para cargar productos del carrito desde localStorage cuando se monta el componente
    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cartProducts')) || []; // Obtener productos guardados en localStorage
        setCartProducts(storedCart); // Establecer los productos en el estado
        calculateTotals(storedCart); // Calcular los totales basados en los productos almacenados
    }, []);

    // Función para calcular los totales del carrito
    const calculateTotals = (products) => {
        // Sumar cantidades, subtotales y costes totales
        const totalQty = products.reduce((sum, product) => sum + product.cantidad, 0); // Suma la cantidad de cada producto
        const totalAmount = products.reduce((sum, product) => sum + product.subtotal, 0); // Suma los subtotales de cada producto
        const totalCostAmount = products.reduce((sum, product) => sum + product.costeTotal, 0); // Suma el coste total por cada producto

        // Actualizar estados locales con los totales
        setTotalQuantity(totalQty);
        setTotalMoney(totalAmount);
        setTotalCost(totalCostAmount);
    };

    // Agrupar productos idénticos en el carrito basándose en su nombre
    const groupedProducts = cartProducts.reduce((acc, product) => {
        const existingProduct = acc.find(p => p.nombre === product.nombre); // Buscar si ya existe un producto con el mismo nombre
        if (existingProduct) {
            // Si el producto ya está en el array, se actualizan sus cantidades, subtotales y observaciones
            existingProduct.cantidad += product.cantidad;
            existingProduct.subtotal += product.subtotal;
            existingProduct.costeTotal += product.costeTotal;
            existingProduct.observaciones += existingProduct.observaciones ? `; ${product.observaciones}` : product.observaciones; // Concatenar observaciones si existen
            existingProduct.metodosPago = existingProduct.metodosPago ? `${existingProduct.metodosPago}, ${product.metodoPago}` : product.metodoPago;
        } else {
            acc.push({ ...product, metodosPago: product.metodoPago });
        }
        return acc;
    }, []);

    // Función para eliminar un producto del carrito basado en su nombre
    const handleRemoveProduct = (productName) => {
        // Filtrar para eliminar todos los productos que coincidan con el nombre
        const updatedCart = cartProducts.filter(product => product.nombre !== productName);
        setCartProducts(updatedCart); // Actualizar el estado del carrito
        localStorage.setItem('cartProducts', JSON.stringify(updatedCart)); // Actualizar localStorage con el nuevo carrito
        calculateTotals(updatedCart); // Recalcular los totales después de eliminar productos
    };

    // Función para actualizar los stocks de los productos en la base de datos de Firebase
    const updateProductStocks = async () => {
        // Verificar si user está definido antes de proceder
        if (!user) {
            console.error('User is undefined, cannot update stocks.');
            throw new Error('User is not authenticated. Cannot update stocks.');
        }
        try {
            for (const product of cartProducts) {
                const productRef = doc(db, `users/${user.uid}/Productos`, product.id);
                const productSnapshot = await getDoc(productRef); // Obtener el snapshot del producto actual
                const currentStock = productSnapshot.data()?.stock; // Obtener el stock actual

                if (currentStock !== undefined) {
                    const newStock = currentStock - product.cantidad; // Calcular el nuevo stock restando la cantidad vendida
                    await updateDoc(productRef, { stock: newStock }); // Actualizar el stock en la base de datos
                }
            }
        } catch (error) {
            console.error('Error al actualizar los stocks:', error); // Mostrar error en caso de fallo
            throw new Error('Error al actualizar los stocks de los productos.'); // Lanzar un error en caso de fallo
        }
    };

    // Función para actualizar la versión en Firestore y en el localStorage
    const updateVersion = async () => {
        const versionDocRef = doc(db, 'users', user.uid, 'Versiones', VERSION_ID);
        const versionSnapshot = await getDoc(versionDocRef);
        const currentVersion = versionSnapshot.data()?.version;

        if (currentVersion !== undefined) {
            await updateDoc(versionDocRef, { version: currentVersion + 1 });
            localStorage.removeItem('products');
            localStorage.setItem('version', currentVersion + 1);
        }
    };
    // Función para enviar la comanda, actualizar stocks y versiones
    // Función para enviar la comanda, actualizar stocks y versiones
    const handleSendOrder = async () => {
        setIsButtonDisabled(true); // Deshabilitar el botón al iniciar el envío
        try {
            await updateProductStocks(); // Actualizar stocks de los productos vendidos
            const order = {
                products: cartProducts, // Productos en la comanda
                totalQuantity, // Cantidad total de productos
                totalMoney, // Total de ingresos generados
                totalCost, // Total de costes
                createdAt: new Date(), // Fecha de creación de la comanda
            };

            await addDoc(collection(db, 'users', user.uid, 'Ventas'), order);
            await updateVersion(); // Actualizar la versión después de enviar la comanda
            Swal.fire({
                title: 'Comanda enviada',
                text: 'La comanda ha sido enviada correctamente.',
                icon: 'success',
            }).then(() => {
                // Rehabilitar el botón después de cerrar el SweetAlert
                setIsButtonDisabled(false);
            });

            // Vaciar el carrito y localStorage después de enviar la comanda
            setCartProducts([]);
            setTotalQuantity(0);
            setTotalMoney(0);
            setTotalCost(0);
            localStorage.removeItem('cartProducts'); // Limpiar el carrito del localStorage
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo enviar la comanda.',
                icon: 'error',
            }).then(() => {
                // Rehabilitar el botón también en caso de error
                setIsButtonDisabled(false);
            });
            console.error('Error al enviar la comanda:', error); // Mostrar error en caso de fallo
        }
    };


    return (
        <div className="store-container">
            <h2 className="store-title">Resumen de Ventas</h2>
            <div className="store-summary">
                {/* Mostrar totales de la venta */}
                <p><strong>Cantidad de productos vendidos:</strong> {totalQuantity}</p>
                <p><strong>Total de ingresos generados:</strong> ${totalMoney}</p>
                <p><strong>Total de dinero gastado:</strong> ${totalCost}</p>
            </div>
            <div className="cart-list">
                {/* Si no hay productos en el carrito, mostrar un mensaje */}
                {groupedProducts.length === 0 ? (
                    <p className="empty-cart">No hay productos en el carrito.</p>
                ) : (
                    // Mostrar lista de productos agrupados en el carrito
                    groupedProducts.map((product, index) => (
                        <div key={index} className="cart-product">
                            <p><strong>Producto:</strong> {product.nombre}</p>
                            <p><strong>Cantidad:</strong> {product.cantidad}</p>
                            <p><strong>Subtotal:</strong> ${product.subtotal ? product.subtotal.toFixed(2) : '0.00'}</p>
                            <p><strong>Coste total:</strong> ${product.costeTotal ? product.costeTotal.toFixed(2) : '0.00'}</p>
                            <p><strong>Método de Pago:</strong> {product.metodosPago}</p> {/* Mostrar métodos de pago concatenados */}
                            {product.observaciones && <p><strong>Observaciones:</strong> {product.observaciones}</p>}
                            <button 
                                className="remove-btn"
                                onClick={() => handleRemoveProduct(product.nombre)} // Eliminar producto del carrito
                            >
                                Eliminar
                            </button>
                        </div>
                    ))
                )}
            </div>
            {/* Botón para enviar la comanda */}
            <button 
                className="send-order-btn" 
                onClick={handleSendOrder} 
                disabled={groupedProducts.length === 0 || isButtonDisabled} // Deshabilitar si no hay productos o si está bloqueado
            >
                Mandar Comanda
            </button>

        </div>
    );
};
Store.propTypes = {
    user: PropTypes.shape({
        uid: PropTypes.string.isRequired,
    }),
};

export default Store; // Exportar componente Store
