/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, getDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../services/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import Swal from 'sweetalert2';
import FilterProducts from '../FilterProducts/FilterProducts.jsx';
import EditProduct from '../EditProduct/EditProduct.jsx';
import PreStore from '../PreStore/PreStore.jsx';
import PaginationComponent from '../Pagination/Pagination.jsx';
import './ReadProducts.css';

const ReadProducts = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [user, setUser] = useState(null);
    const [productToEdit, setProductToEdit] = useState(null);
    const [showPreStore, setShowPreStore] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8); // Cantidad de elementos por página
    const [totalPages, setTotalPages] = useState(0); // Número total de páginas
    

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return unsubscribe;
    }, []);
    // Cambiar esta parte donde defines los productos a mostrar según la página actual
    useEffect(() => {
        const indexOfLastProduct = currentPage * itemsPerPage;
        const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
        setFilteredProducts(products.slice(indexOfFirstProduct, indexOfLastProduct));
    }, [currentPage, products, itemsPerPage]);
    useEffect(() => {
        const total = Math.ceil(products.length / itemsPerPage);
        setTotalPages(total); // Debes agregar `setTotalPages` en tu estado
    }, [products, itemsPerPage]);
    
    useEffect(() => {
        if (user) {
            const fetchProducts = async () => {
                setLoading(true);
                setError(null);

                try {
                    const versionDoc = await getDoc(doc(db, 'users', user.uid, 'Versiones', 'version vigente'));
                    const firebaseVersion = versionDoc.data()?.version;
                    console.log(`Versión actual en Firebase: ${firebaseVersion}`);
                    const localVersion = localStorage.getItem('version');
                    console.log(`Versión almacenada localmente: ${localVersion}`);

                    if (localVersion && firebaseVersion === Number(localVersion)) {
                        const storedProducts = JSON.parse(localStorage.getItem('products')) || [];
                        if (storedProducts.length > 0) {
                            setProducts(storedProducts);
                            setFilteredProducts(storedProducts.slice(0, itemsPerPage));
                            console.log('Productos obtenidos de localStorage.');
                            setLoading(false);
                            return;
                        }
                    } else {
                        localStorage.removeItem('products');
                    }

                    const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'Productos'));
                    const productsList = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));

                    setProducts(productsList);
                    setFilteredProducts(productsList.slice(0, itemsPerPage));
                    localStorage.setItem('products', JSON.stringify(productsList));
                    localStorage.setItem('version', firebaseVersion);
                    console.log('Productos obtenidos de Firebase.');
                    setLoading(false);
                } catch (error) {
                    setError('No se pudieron cargar los productos.');
                    setLoading(false);
                }
            };
            fetchProducts();
        }
    }, [user, itemsPerPage]);

    const fetchFilteredProductsFromFirebase = async (name, barcode, category) => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'Productos'));
            const allProducts = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            const filtered = allProducts.filter(product =>
                (name ? product.nombre.toLowerCase().includes(name.toLowerCase()) : true) &&
                (barcode ? product.codigo.includes(barcode) : true) &&
                (category ? product.categoria === category : true)
            );

            setProducts(filtered);
            setFilteredProducts(filtered.slice(0, itemsPerPage));
            setLoading(false);
        } catch (error) {
            setError('No se pudieron cargar los productos filtrados.');
            setLoading(false);
        }
    };

    const onPageChange = (page) => {
        setCurrentPage(page);
    };
    const handleFilter = useCallback((filters) => {
        const { name, barcode, category } = filters;

        if (!name && !barcode && !category) {
            setFilteredProducts(products); // Muestra todos los productos
            setCurrentPage(1);
            return;
        }

        let filtered = products.filter(product =>
            (name ? product.nombre.toLowerCase().includes(name.toLowerCase()) : true) &&
            (barcode ? product.codigo.includes(barcode) : true) &&
            (category ? product.categoria === category : true)
        );
        setFilteredProducts(filtered.slice(0, itemsPerPage));  // Muestra los primeros 8 productos filtrados
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        setCurrentPage(1); // Reinicia a la primera página

        if (filtered.length === 0 && products.length === 0) {
            fetchFilteredProductsFromFirebase(name, barcode, category);
        }
    }, [products]);

    const handleEdit = (product) => {
        setProductToEdit(product);
    };

    const handleProductUpdate = () => {
        setProductToEdit(null);
        const fetchUpdatedProducts = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'Productos'));
                const productsList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setProducts(productsList);
                setFilteredProducts(productsList.slice(0, itemsPerPage));
            } catch (error) {
                console.error('Error al leer productos:', error);
            }
        };
        fetchUpdatedProducts();
    };

    const handleCancel = () => {
        setProductToEdit(null);
    };

    const handleDelete = async (productId) => {
        try {
            await deleteDoc(doc(db, 'users', user.uid, 'Productos', productId));
            const updatedProducts = products.filter(product => product.id !== productId);
            setProducts(updatedProducts);
            setFilteredProducts(updatedProducts);
            localStorage.setItem('products', JSON.stringify(updatedProducts));

            Swal.fire({
                title: 'Producto eliminado',
                text: 'El producto ha sido eliminado con éxito.',
                icon: 'success',
            });
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar el producto.',
                icon: 'error',
            });
            console.error('Error al eliminar producto:', error);
        }
    };

    const handleAddToSold = (product) => {
        setSelectedProduct(product);
        setShowPreStore(true);
    };

    const handleConfirmSold = (soldProduct) => {
        const storedCartProducts = JSON.parse(localStorage.getItem('cartProducts')) || [];
        storedCartProducts.push(soldProduct);
        localStorage.setItem('cartProducts', JSON.stringify(storedCartProducts));
        setShowPreStore(false);

        Swal.fire({
            title: 'Producto añadido a Vendidos',
            text: `${soldProduct.nombre} ha sido añadido con éxito.`,
            icon: 'success',
        });
    };

    if (!user) {
        return <p>Por favor, inicie sesión para ver los productos.</p>;
    }

    return (
        <div>
            <h2>Lista de Productos</h2>
            <FilterProducts userId={user ? user.uid : ''} onFilter={handleFilter} />
            {productToEdit ? (
                <EditProduct
                    product={productToEdit}
                    onProductUpdate={handleProductUpdate}
                    onCancel={handleCancel}
                    user={user}
                />
            ) : (
                <>
                    {loading ? (
                        <div className="spinner"></div>
                    ) : error ? (
                        <p>{error}</p>
                    ) : filteredProducts.length === 0 ? (
                        <p>No hay productos disponibles.</p>
                    ) : (
                        <div className="products-grid">
                            {filteredProducts.map(product => (
                                <div key={product.id} className="product-card">
                                    <h3>{product.nombre}</h3>
                                    <p><strong>Código:</strong> {product.codigo}</p>
                                    <p><strong>Categoría:</strong> {product.categoria || 'N/A'}</p>
                                    <p><strong>Coste:</strong> ${product.coste}</p>
                                    <p><strong>Precio:</strong> ${product.precio}</p>
                                    <p><strong>Stock:</strong> {product.stock}</p>
                                    <p><strong>Observaciones:</strong> {product.observaciones}</p>
                                    <div className="button-container">
                                        <button className="delete-button" onClick={() => handleDelete(product.id)}>
                                            Eliminar
                                        </button>
                                        <button className="edit-button" onClick={() => handleEdit(product)}>
                                            Editar
                                        </button>
                                        <button className="cart-button" onClick={() => handleAddToSold(product)}>
                                            Vendido
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <PaginationComponent
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                    />
                </>
            )}
            {showPreStore && selectedProduct && (
                <PreStore
                    product={selectedProduct}
                    onConfirm={handleConfirmSold}
                    onClose={() => setShowPreStore(false)} // Añadir la función para cerrar el modal
                />
            )}
        </div>
    );
};


export default ReadProducts;
