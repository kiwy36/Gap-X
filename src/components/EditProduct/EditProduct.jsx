/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect ,useCallback} from 'react';
import { doc, updateDoc, collection, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import Swal from 'sweetalert2';
import './EditProduct.css';
import PropTypes from 'prop-types';

// ID de la colección de versiones en Firebase
const VERSION_ID = 'version vigente';

const EditProduct = ({ product, onProductUpdate, onCancel , user}) => {
    // Estado local para el producto que se está editando
    const [localProduct, setLocalProduct] = useState(product);
    // Estado local para las categorías disponibles
    const [categories, setCategories] = useState([]);
    // Estado para mostrar un spinner de carga cuando se actualiza el producto
    const [loading, setLoading] = useState(false);

    // Función para cargar las categorías desde Firebase y ordenarlas alfabéticamente
    const loadCategories = useCallback(async () => {
        const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'UserCategories'));
        const loadedCategories = querySnapshot.docs
            .map(doc => doc.data().name) // Extraer solo el nombre de cada categoría
            .sort((a, b) => a.localeCompare(b)); // Ordenar alfabéticamente
    
        setCategories(loadedCategories); // Guardar las categorías en el estado
    }, [user.uid]); // Añade user.uid como dependencia
    
    // useEffect
    useEffect(() => {
        setLocalProduct(product); // Actualiza el producto local cuando cambie la prop product
        loadCategories(); // Cargar las categorías al montar el componente
    }, [product, user.uid, loadCategories]);


    // Manejar cambios en los inputs del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalProduct((prev) => ({ ...prev, [name]: value })); // Actualizar el estado local del producto
    };

    const updateVersion = async () => {
        const versionDocRef = doc(db, 'users', user.uid, 'Versiones', VERSION_ID);
        const versionSnapshot = await getDoc(versionDocRef);
        const currentVersion = versionSnapshot.data()?.version;

        if (currentVersion !== undefined) {
            await updateDoc(versionDocRef, { version: currentVersion + 1 });

            // Borrar el localStorage cuando la versión se actualiza
            localStorage.removeItem('products');
            localStorage.setItem('version', currentVersion + 1);
        }
    };

    // Manejar el envío del formulario para actualizar el producto
    const handleSubmit = async (e) => {
        e.preventDefault(); // Evitar el comportamiento predeterminado del formulario
        setLoading(true); // Activar el estado de carga

        try {
            // Actualizar el producto en Firebase
            await updateDoc(doc(db, 'users', user.uid, 'Productos', localProduct.id), localProduct);
            // Actualizar la versión en Firebase y en localStorage
            await updateVersion();
            // Mostrar mensaje de éxito con SweetAlert
            Swal.fire({
                title: 'Éxito',
                text: 'Producto actualizado con éxito',
                icon: 'success',
            });
            // Llamar la función para actualizar el estado del producto en el componente padre
            onProductUpdate();
        } catch (error) {
            // Manejar errores y mostrar mensaje de error con SweetAlert
            Swal.fire({
                title: 'Error',
                text: 'Error al actualizar el producto. Inténtelo de nuevo.',
                icon: 'error',
            });
            console.error('Error al actualizar el producto:', error);
        } finally {
            setLoading(false); // Desactivar el estado de carga
        }
    };

    return (
        <div className="edit-product">
            <h1 className='title-edit-product'>Editar producto</h1>
            <form onSubmit={handleSubmit}>
                {/* Input para el nombre del producto */}
                <h2 className='subTitle-edit-product'>Nombre del producto</h2>
                <input
                    name="nombre"
                    placeholder="Nombre"
                    value={localProduct.nombre}
                    onChange={handleChange}
                    required
                />
                {/* Input para el código de barra del producto */}
                <h2 className='subTitle-edit-product'>Codigo de barra</h2>
                <input
                    name="codigo"
                    placeholder="Código de Barra"
                    value={localProduct.codigo}
                    onChange={handleChange}
                    required
                />
                {/* Select para elegir la categoría del producto */}
                <h2 className='subTitle-edit-product'>Categoria</h2>
                <select
                    name="categoria"
                    value={localProduct.categoria || ''}
                    onChange={handleChange}
                    required
                >
                    <option value="">Selecciona una categoría</option>
                    {categories.map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                    ))}
                </select>
                {/* Input para el coste del producto (Nuevo Campo) */}
                <h2 className='subTitle-edit-product'>Coste</h2>
                <input
                    name="coste"
                    type="number"
                    placeholder="Coste"
                    value={localProduct.coste || ''} // Valor del campo coste
                    onChange={handleChange}
                    min="0"
                    required
                />
                {/* Input para el precio del producto */}
                <h2 className='subTitle-edit-product'>Precio</h2>
                <input
                    name="precio"
                    type="number"
                    placeholder="Precio"
                    value={localProduct.precio}
                    onChange={handleChange}
                    min="0"
                    required
                />
                {/* Input para el stock del producto */}
                <h2 className='subTitle-edit-product'>Stock disponible</h2>
                <input
                    name="stock"
                    type="number"
                    placeholder="Stock"
                    value={localProduct.stock}
                    onChange={handleChange}
                    min="0"
                    required
                />
                {/* Textarea para las observaciones del producto */}
                <h2 className='subTitle-edit-product'>Agregar observaciones</h2>
                <textarea
                    name="observaciones"
                    placeholder="Observaciones (máx. 30 caracteres)"
                    value={localProduct.observaciones || ''}
                    onChange={handleChange}
                    maxLength={30}
                />
                {/* Botones para cancelar y enviar el formulario */}
                <div className="button-group">
                    <button type="button" className="cancel-button" onClick={onCancel}>
                        Cancelar Actualización
                    </button>
                    <button className="submit-button" type="submit" disabled={loading}>
                        {loading ? 'Actualizando...' : 'Actualizar Producto'}
                    </button>
                </div>
            </form>
        </div>
    );
};

EditProduct.propTypes = {
    product: PropTypes.shape({
        id: PropTypes.string.isRequired,
        nombre: PropTypes.string.isRequired,
        codigo: PropTypes.string.isRequired,
        categoria: PropTypes.string.isRequired,
        precio: PropTypes.number.isRequired,
        stock: PropTypes.number.isRequired,
        coste: PropTypes.number.isRequired, // Validación para el nuevo campo coste
        observaciones: PropTypes.string,
    }).isRequired,
    onProductUpdate: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    user: PropTypes.shape({
        uid: PropTypes.string.isRequired, // Asegúrate de que `user` tenga un uid
    }).isRequired,
};

export default EditProduct;
