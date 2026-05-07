// src/services/ventaService.js
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

// Crear venta
export const createVenta = async (accountId, ventaData, userId) => {
  try {
    const ventasRef = collection(db, `Accounts/${accountId}/Ventas`);
    const docRef = await addDoc(ventasRef, {
      ...ventaData,
      userId: userId,
      fecha: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error al crear venta:', error);
    return { success: false, error: error.message };
  }
};

// Obtener todas las ventas
export const getVentas = async (accountId) => {
  try {
    const ventasRef = collection(db, `Accounts/${accountId}/Ventas`);
    const snapshot = await getDocs(ventasRef);
    const ventas = [];
    snapshot.forEach(doc => {
      ventas.push({ id: doc.id, ...doc.data() });
    });
    return ventas;
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    return [];
  }
};

// Anular venta (solo admin)
export const anularVenta = async (accountId, ventaId) => {
  try {
    const ventaRef = doc(db, `Accounts/${accountId}/Ventas`, ventaId);
    await deleteDoc(ventaRef);
    return { success: true };
  } catch (error) {
    console.error('Error al anular venta:', error);
    return { success: false, error: error.message };
  }
};