import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import Swal from 'sweetalert2';
import './UploadProduct.css';
import PropTypes from 'prop-types';

// ID del documento donde se maneja la versión en Firestore
const VERSION_ID = 'version vigente';

const UploadProduct = ({ user }) => {
    // Estado inicial del producto con sus campos
    const [product, setProduct] = useState({
        nombre: '',
        codigo: '',
        coste: '',
        precio: '',
        categoria: '',
        stock: '',
        observaciones: '',
    });

    // Estado para manejar las categorías disponibles
    const [categories, setCategories] = useState([]);
    
    // Estado para manejar la nueva categoría que el usuario desea añadir
    const [newCategory, setNewCategory] = useState('');

    // Estado para mostrar un indicador de carga durante la subida de producto
    const [loading, setLoading] = useState(false);

    // Función para cargar las categorías personalizadas desde Firestore
    const loadCategories = useCallback(async () => {
        if (!user?.uid) return;  // Verificación de `user` y `uid`
        
        try {
            const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'UserCategories'));
            const loadedCategories = querySnapshot.docs
                .map(doc => doc.data().name)
                .sort((a, b) => a.localeCompare(b));
            setCategories(loadedCategories);
        } catch (error) {
            console.error('Error cargando categorías:', error);
        }
    }, [user]);
    

    // Ejecutar al montar el componente
    useEffect(() => {
        if (user?.uid) {  // Verificación de `user` y `uid`
            loadCategories();
        }
    }, [user, loadCategories]);

    // Función para capitalizar la primera letra de un string (usado en nombres y categorías)
    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    // Función que maneja los cambios en los inputs del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        const formattedValue = name === 'nombre' ? capitalizeFirstLetter(value) : value;
        setProduct((prev) => ({ ...prev, [name]: formattedValue }));
    };

    // Función para manejar el cambio del campo de nueva categoría
    const handleNewCategoryChange = (e) => {
        setNewCategory(e.target.value);
    };

    // Función para añadir una nueva categoría a Firestore
    const handleAddCategory = async () => {
        if (!user?.uid) return; // Verificación de `user` y `uid`
    
        if (newCategory.trim() === '') {
            Swal.fire({
                title: 'Error',
                text: 'La categoría no puede estar vacía.',
                icon: 'error',
            });
            return;
        }
    
        try {
            // Verificar si "Gestionar categorías" existe y eliminarla solo la primera vez
            if (categories.includes("Gestionar categorias")) {
                const gestionarCatRef = query(
                    collection(db, 'users', user.uid, 'UserCategories'),
                    where("name", "==", "Gestionar categorias")
                );
                const gestionarCatSnapshot = await getDocs(gestionarCatRef);
    
                if (!gestionarCatSnapshot.empty) {
                    const docId = gestionarCatSnapshot.docs[0].id; // ID del documento de "Gestionar categorias"
                    await deleteDoc(doc(db, 'users', user.uid, 'UserCategories', docId)); // Eliminar de Firestore
                    setCategories((prevCategories) =>
                        prevCategories.filter((cat) => cat !== "Gestionar categorias")
                    ); // Eliminar de estado local
                }
            }
    
            // Añadir la nueva categoría
            await addDoc(collection(db, 'users', user.uid, 'UserCategories'), { name: capitalizeFirstLetter(newCategory) });
            setNewCategory(''); // Limpiar el campo de entrada
            await loadCategories(); // Volver a cargar las categorías
    
            Swal.fire({
                title: 'Éxito',
                text: 'Categoría añadida con éxito',
                icon: 'success',
            });
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Error al agregar la categoría. Inténtelo de nuevo.',
                icon: 'error',
            });
            console.error('Error al agregar la categoría:', error);
        }
    };

    // Función para actualizar la versión en Firestore y el localStorage
    const updateVersion = async () => {
        if (!user?.uid) return; // Verificación de `user` y `uid`
        
        const versionDocRef = doc(db, 'users', user.uid, 'Versiones', VERSION_ID);
        const versionSnapshot = await getDoc(versionDocRef);
        const currentVersion = versionSnapshot.data()?.version;
    
        if (currentVersion !== undefined) {
            await updateDoc(versionDocRef, { version: currentVersion + 1 });
            localStorage.removeItem('products');
            localStorage.setItem('version', currentVersion + 1);
        }
    };

    // Función que maneja el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (product.coste < 0 || product.precio < 0 || product.stock < 0) {
            Swal.fire({
                title: 'Error',
                text: 'Coste, precio y stock deben ser valores positivos.',
                icon: 'error',
            });
            setLoading(false);
            return;
        }

        const q = query(collection(db, 'users', user.uid, 'Productos'), where('codigo', '==', product.codigo));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            try {
                await addDoc(collection(db, 'users', user.uid, 'Productos'), product);
                await updateVersion();
                Swal.fire({
                    title: 'Éxito',
                    text: 'Producto subido con éxito',
                    icon: 'success',
                });
                setProduct({
                    nombre: '',
                    codigo: '',
                    coste: '',
                    precio: '',
                    categoria: '',
                    stock: '',
                    observaciones: '',
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: 'Error al subir el producto. Inténtelo de nuevo.',
                    icon: 'error',
                });
                console.error('Error al subir el producto:', error);
            }
        } else {
            Swal.fire({
                title: 'Error',
                text: 'Ya existe un producto con ese código.',
                icon: 'error',
            });
        }

        setLoading(false);
    };

    return (
        <section>
            <form onSubmit={handleSubmit} className="upload-form">
                <h2 className='subTitle-uploadProduct'>Subir Producto</h2>
                <input name="nombre" placeholder="Nombre" value={product.nombre} onChange={handleChange} required />
                <input name="codigo" placeholder="Código de barra" value={product.codigo} onChange={handleChange} type="text" required />
                <input name="coste" placeholder="Coste" type="number" value={product.coste} onChange={handleChange} min="0" required />
                <input name="precio" placeholder="Precio" type="number" value={product.precio} onChange={handleChange} min="0" required />
                <select name="categoria" value={product.categoria} onChange={handleChange} required>
                    <option value="">Selecciona una categoría</option>
                    {categories.map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                    ))}
                </select>
                <div className="new-category-container">
                    <input type="text" placeholder="Nueva categoría" value={newCategory} onChange={handleNewCategoryChange} />
                    <button type="button" onClick={handleAddCategory}>Añadir Categoría</button>
                </div>
                <input name="stock" placeholder="Stock" type="number" value={product.stock} onChange={handleChange} min="0" required />
                <textarea name="observaciones" placeholder="Observaciones" value={product.observaciones} onChange={handleChange} />
                <button type="submit" disabled={loading}>{loading ? 'Cargando...' : 'Subir Producto'}</button>
            </form>
        </section>
    );
};

UploadProduct.propTypes = {
    user: PropTypes.shape({
        uid: PropTypes.string.isRequired,
    }).isRequired,
};

export default UploadProduct;
