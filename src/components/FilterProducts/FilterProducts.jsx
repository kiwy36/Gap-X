import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase.js';
import './FilterProducts.css'; // Estilos específicos para el componente

const FilterProducts = ({ userId, onFilter }) => {
    const [name, setName] = useState(''); // Almacena el filtro de nombre
    const [barcode, setBarcode] = useState(''); // Almacena el filtro de código de barra
    const [category, setCategory] = useState(''); // Almacena la categoría seleccionada
    const [categories, setCategories] = useState([]); // Almacena la lista de categorías disponibles
    const [error, setError] = useState(null); // Estado para manejar errores

    const loadCategories = useCallback(async () => {
        if (!userId) return; // Asegúrate de que el userId esté disponible

        try {
            // Obtener documentos de la subcolección 'UserCategories' del usuario en Firebase
            const querySnapshot = await getDocs(collection(db, 'users', userId, 'UserCategories'));

            // Procesar las categorías, ordenarlas y guardarlas en el estado
            const loadedCategories = querySnapshot.docs
                .map(doc => doc.data().name) // Extraer el campo 'name' de cada documento
                .sort((a, b) => a.localeCompare(b)); // Ordenarlas alfabéticamente

            setCategories(loadedCategories); // Actualizar el estado con las categorías cargadas
            setError(null); // Limpiar cualquier error anterior
        } catch (err) {
            console.error("Error al cargar categorías:", err); // Mostrar el error en la consola
            setError("No se pudieron cargar las categorías."); // Establecer un mensaje de error
        }
    }, [userId]);

    useEffect(() => {
        loadCategories(); // Cargar las categorías cuando se monte el componente o cambie el userId
    }, [loadCategories]);

    // Función que invoca `onFilter` con los valores actuales de los filtros
    const handleFilter = useCallback(() => {
        onFilter({ name, barcode, category });
    }, [name, barcode, category, onFilter]);

    // Ejecutar `handleFilter` cada vez que se cambien los valores del nombre, código de barra o categoría
    useEffect(() => {
        handleFilter(); // Llamar a la función de filtrado
    }, [name, barcode, category, handleFilter]);

    return (
        <div className="filter-products">
            {/* Mensaje de error si ocurre */}
            {error && <div className="error-message">{error}</div>}
            
            {/* Filtro por nombre */}
            <input
                type="text"
                placeholder="Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="filter-input"
            />

            {/* Filtro por código de barra */}
            <input
                type="text"
                placeholder="Código de barra"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="filter-input"
            />

            {/* Filtro por categoría */}
            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="filter-select"
            >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat, index) => (
                    <option key={index} value={cat}>{cat}</option>
                ))}
            </select>
        </div>
    );
};

FilterProducts.propTypes = {
    userId: PropTypes.string.isRequired,
    onFilter: PropTypes.func.isRequired,
};

export default FilterProducts;
