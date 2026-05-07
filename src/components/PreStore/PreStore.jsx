import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import './PreStore.css';
const PreStore = ({ product, onClose, onConfirm }) => {
    // Estado para manejar la cantidad seleccionada
    const [quantity, setQuantity] = useState(1);
    
    // Estado para manejar las observaciones ingresadas por el usuario
    const [observations, setObservations] = useState('');

    // Estado para controlar la cantidad máxima seleccionable basada en el stock disponible
    const [maxSelectable, setMaxSelectable] = useState(product.stock);

    const [paymentMethod, setPaymentMethod] = useState(''); // Nuevo estado para el método de pago
   
    // Estado para almacenar la cantidad total vendida del producto (obtenida desde localStorage)
    // eslint-disable-next-line no-unused-vars
    const [totalSold, setTotalSold] = useState(0);

    // useEffect para actualizar el stock máximo basado en las cantidades ya agregadas al carrito
    useEffect(() => {
        // Recuperamos los productos del carrito almacenados en localStorage
        const storedCart = JSON.parse(localStorage.getItem('cartProducts')) || [];

        // Calculamos la cantidad total de productos vendidos del mismo tipo que ya están en el carrito
        const totalSoldProducts = storedCart.reduce((sum, p) => sum + (p.nombre === product.nombre ? p.cantidad : 0), 0);
        
        // Actualizamos el estado con el total vendido
        setTotalSold(totalSoldProducts);
    
        // Calculamos el stock restante, asegurándonos de que no sea negativo
        const remainingStock = product.stock - totalSoldProducts;
        setMaxSelectable(remainingStock > 0 ? remainingStock : 0);
    }, [product]); // Se vuelve a ejecutar cuando cambia el producto

    // Maneja el cambio en la cantidad seleccionada por el usuario
    const handleQuantityChange = (e) => {
        const selectedQuantity = parseInt(e.target.value, 10);

        // Verificación: Si la cantidad seleccionada excede el stock disponible
        if (selectedQuantity > maxSelectable) {
            Swal.fire({
                icon: 'error',
                title: 'Stock insuficiente',
                text: `No puedes seleccionar más de ${maxSelectable} unidades de este producto.`,
            });
            setQuantity(maxSelectable); // Ajustamos la cantidad al máximo disponible
        } 
        // Verificación: Si la cantidad es menor que 1 o no es un número válido
        else if (selectedQuantity < 1 || isNaN(selectedQuantity)) {
            setQuantity(0); // Establecemos la cantidad a 0
        } 
        // Caso válido: Actualizamos la cantidad con el valor ingresado
        else {
            setQuantity(selectedQuantity);
        }
    };

    // Función que se ejecuta cuando el usuario confirma la selección
    const handleConfirm = () => {
        // Verificación: La cantidad debe ser al menos 1
        if (quantity < 1) {
            Swal.fire({
                icon: 'error',
                title: 'Cantidad inválida',
                text: 'Debes seleccionar al menos 1 unidad para continuar.',
            });
            return; // Salimos de la función si no es válido
        }

        // Verificación: La cantidad no puede superar el stock disponible
        if (quantity > maxSelectable) {
            Swal.fire({
                icon: 'error',
                title: 'Stock insuficiente',
                text: `Solo hay ${maxSelectable} unidades disponibles de ${product.nombre}.`,
            });
            return; // Salimos de la función si no es válido
        }

        // **Nueva Verificación: El campo de "Método de pago" no debe estar vacío**
        if (!paymentMethod.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Método de pago requerido',
                text: 'Por favor, completa el campo de "Método de pago" antes de confirmar.',
            });
            return; // Salimos de la función si el campo está vacío
        }
        // Calcular subtotal (precio total) y el coste total para este producto
        const subtotal = quantity * product.precio;
        const costeTotal = quantity * product.coste;

        // Crear el objeto con los detalles del producto vendido
        const soldProduct = {
            id: product.id, // Asegúrate de que cada producto tenga un ID único
            nombre: product.nombre,
            cantidad: quantity,
            subtotal, // Precio total
            costeTotal, // Coste total del producto
            observaciones: observations, // Observaciones del usuario
            metodoPago: paymentMethod,
        };

        // Llamamos a la función 'onConfirm' (del componente padre) y pasamos el producto vendido
        onConfirm(soldProduct);

        // Cerramos el modal llamando a 'onClose'
        onClose();
    };

    // Calcular el coste total del producto basado en la cantidad seleccionada
    const totalCost = quantity > 0 ? quantity * product.coste : null;
    const paymentMethods = [
        'Efectivo',
        'Tarjeta de débito',
        'Tarjeta de crédito',
        'Tarjeta prepago',
        'Transferencia bancaria',
        'Cheque',
        'Pago móvil',
        'Billetera digital',
        'Pago por QR',
        'Débito automático',
        'Criptomonedas',
        'Pago en línea',
    ];
    // Renderizado del componente PreStore
    return (
        <div className="prestore-modal">
            <h2>{product.nombre}</h2>
            <p className='prestoreItem'><strong>Precio:</strong> ${product.precio}</p>
            <p className='prestoreItem'><strong>Stock disponible:</strong> {product.stock}</p>

            {/* Sección para seleccionar la cantidad */}
            <div className='prestoreItem'>
                <label>
                    Cantidad:
                    <input 
                        type="number" 
                        value={quantity}
                        onChange={handleQuantityChange}
                        min="1" 
                        max={maxSelectable} // Límite máximo basado en el stock
                        className="quantity-input"
                    />
                </label>
                <span className="available-quantity"> (Máximo seleccionable: {maxSelectable})</span>
            </div>

            <br/>

            {/* Campo para ingresar observaciones */}
            <div className='prestoreItem'>
                <label>
                    Observaciones:
                    <input 
                        type="text" 
                        value={observations} 
                        onChange={(e) => setObservations(e.target.value)}
                        maxLength="60"
                    />
                </label>
            </div>
            {/* Nuevo campo para "Método de pago" */}
            <div className='prestoreItem prestore-method-container'>
                <label className='prestore-method-label'>
                    Método de pago:
                    <select
                        className='prestore-method-select'
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)} 
                        required
                    >
                        <option value="">Selecciona un método de pago</option>
                        {paymentMethods.map((method, index) => (
                            <option key={index} value={method}>{method}</option>
                        ))}
                    </select>
                </label>
            </div>
            <br/>
            {/* Mostrar el total calculado */}
            <p className='prestoreItem'><strong>Total:</strong> {quantity > 0 ? `$${quantity * product.precio}` : 'Elija número de productos'}</p>

            {/* Mostrar el coste total calculado */}
            <p className='prestoreItem'><strong>Coste total:</strong> {totalCost !== null ? `$${totalCost}` : 'Elija número de productos'}</p> 
            
            {/* Botones para cancelar o confirmar la acción */}
            <button className='PreStore-cancel' onClick={onClose}>Cancelar</button>
            <button 
                className='PreStore-confirm'
                onClick={handleConfirm}
                disabled={maxSelectable === 0} // Deshabilitado si no hay stock disponible
            >
                Confirmar
            </button>

            <br/>

            {/* Mensaje que se muestra si se alcanza el máximo de stock */}
            {maxSelectable === 0 && (
                <span className="max-reached-message">¡Se alcanzó el máximo de {product.nombre} disponible!</span>
            )}
        </div>
    );
};

// Validación de los tipos de las propiedades (props)
PreStore.propTypes = {
    product: PropTypes.shape({
        id: PropTypes.string.isRequired, // ID único del producto
        nombre: PropTypes.string.isRequired, // Nombre del producto
        precio: PropTypes.number.isRequired, // Precio del producto
        stock: PropTypes.number.isRequired, // Stock disponible
        coste: PropTypes.number.isRequired, // Coste del producto
    }).isRequired,
    onClose: PropTypes.func.isRequired, // Función para cerrar el modal
    onConfirm: PropTypes.func.isRequired, // Función para confirmar la venta
};

// Exportamos el componente PreStore
export default PreStore;
