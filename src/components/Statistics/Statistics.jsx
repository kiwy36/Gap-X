import { useState } from 'react'; 
import { collection, query, where, getDocs } from 'firebase/firestore'; 
import { db } from '../../services/firebase'; 
import './Statistics.css'; 
import PropTypes from 'prop-types';

const Statistics = ({ user }) => { 
    // Estados para manejar fechas, ventas, y estadísticas
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [salesData, setSalesData] = useState([]);
    const [mostSoldProduct, setMostSoldProduct] = useState(null);
    const [totalRevenue, setTotalRevenue] = useState(0); 
    const [totalCost, setTotalCost] = useState(0); 
    const [totalProfit, setTotalProfit] = useState(0); 
    const [observations, setObservations] = useState([]); 
    const [methodsOfPayment, setMethodsOfPayment] = useState([]);  // Nuevo estado para los métodos de pago

    const fetchSalesBetweenDates = async () => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1); // Asegura que se incluye el último día

            try {
                const q = query(
                    collection(db, `users/${user.uid}/Ventas`),
                    where('createdAt', '>=', start),
                    where('createdAt', '<', end)
                );

                const querySnapshot = await getDocs(q); 
                const sales = [];
                const allObservations = []; 
                const allMethodsOfPayment = [];  // Array para los métodos de pago

                querySnapshot.forEach((doc) => {
                    const saleData = doc.data();
                    sales.push(saleData);
                    
                    saleData.products.forEach((product) => {
                        // Agregar observaciones
                        if (product.observaciones && product.observaciones.trim() !== "") {
                            allObservations.push(`${product.nombre}: ${product.observaciones}`);
                        }

                        // Agregar métodos de pago
                        if (product.metodoPago && product.metodoPago.trim() !== "") {
                            allMethodsOfPayment.push(`${product.nombre}: ${product.metodoPago}`);
                        }
                    });
                });

                setObservations(allObservations); 
                setMethodsOfPayment(allMethodsOfPayment);  // Guardar los métodos de pago
                processSalesData(sales);
            } catch (error) {
                console.error("Error al obtener las ventas: ", error);
            }
        }
    };

    const processSalesData = (sales) => {
        const total = {};
        let revenue = 0;
        let cost = 0;

        sales.forEach((sale) => {
            sale.products.forEach((product) => {
                if (!total[product.nombre]) {
                    total[product.nombre] = { quantity: 0, subtotal: 0, cost: 0 };
                }
                total[product.nombre].quantity += product.cantidad;
                total[product.nombre].subtotal += product.subtotal;
                total[product.nombre].cost += product.costeTotal;

                revenue += product.subtotal; 
                cost += product.costeTotal; 
            });
        });

        setTotalRevenue(revenue);
        setTotalCost(cost);
        setTotalProfit(revenue - cost); 

        const totalSalesArray = Object.keys(total).map((key) => ({
            name: key,
            quantity: total[key].quantity,
            subtotal: total[key].subtotal,
            cost: total[key].cost
        }));

        setSalesData(totalSalesArray); 

        const mostSold = totalSalesArray.reduce((prev, current) =>
            current.quantity > prev.quantity ? current : prev,
            { name: '', quantity: 0 }
        );
        setMostSoldProduct(mostSold); 
    };

    return (
        <div className="statistics-container">
            <h2>Estadísticas de Ventas</h2>
            <div className="date-selector">
                <label>
                    Fecha de inicio:
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)} 
                    />
                </label>
                <label>
                    Fecha de fin:
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)} 
                    />
                </label>
                <button onClick={fetchSalesBetweenDates}>Obtener Estadísticas</button>
            </div>

            <div className="sales-summary">
                <h3>Sumatoria de Ventas</h3>
                {salesData.length > 0 ? (
                    <ul>
                        {salesData.map((product, index) => (
                            <li key={index}>
                                <strong>{product.name}</strong>: {product.quantity} unidades vendidas - Total: ${product.subtotal.toFixed(2)} - Coste: ${product.cost.toFixed(2)}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No se encontraron ventas en el periodo seleccionado.</p>
                )}
            </div>

            <div className="most-sold-product">
                <h3>Producto más vendido</h3>
                {mostSoldProduct ? (
                    <p>
                        <strong>{mostSoldProduct.name}</strong> con {mostSoldProduct.quantity} unidades vendidas.
                    </p>
                ) : (
                    <p>No hay datos de ventas.</p>
                )}
            </div>

            <div className="financial-summary">
                <h3>Resumen Financiero</h3>
                <p><strong>Ingresos totales:</strong> ${totalRevenue.toFixed(2)}</p>
                <p><strong>Costes totales:</strong> ${totalCost.toFixed(2)}</p>
                <p><strong>Ganancias totales:</strong> ${totalProfit.toFixed(2)}</p>
            </div>

            <div className="observations-section">
                <h3>Observaciones</h3>
                {observations.length > 0 ? (
                    <ul>
                        {observations.map((obs, index) => (
                            <li key={index}>{obs}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No hay observaciones para este periodo.</p>
                )}
            </div>

            {/* Nueva sección para mostrar los métodos de pago */}
            <div className="observations-section">
                <h3>Métodos de Pago</h3>
                {methodsOfPayment.length > 0 ? (
                    <ul>
                        {methodsOfPayment.map((method, index) => (
                            <li key={index}>{method}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No hay métodos de pago registrados para este periodo.</p>
                )}
            </div>
        </div>
    );
};

Statistics.propTypes = {
    user: PropTypes.shape({
        uid: PropTypes.string.isRequired,
    }).isRequired,
};

export default Statistics;
