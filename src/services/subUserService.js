// src/services/subUserService.js
import { db } from '../firebase';
// eslint-disable-next-line no-unused-vars
import { doc, setDoc, getDoc, getDocs, collection, updateDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';

// Crear un nuevo sub-usuario
export const createSubUser = async (accountId, userId, userData) => {
  try {
    const subUserRef = doc(db, `Accounts/${accountId}/SubUsers`, userId);
    await setDoc(subUserRef, {
      ...userData,
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
      isActive: true
    });
    return { success: true };
  } catch (error) {
    console.error('Error al crear sub-usuario:', error);
    return { success: false, error: error.message };
  }
};

// Obtener todos los sub-usuarios de una cuenta
export const getSubUsers = async (accountId) => {
  try {
    const subUsersRef = collection(db, `Accounts/${accountId}/SubUsers`);
    const snapshot = await getDocs(subUsersRef);
    const subUsers = [];
    snapshot.forEach(doc => {
      subUsers.push({ id: doc.id, ...doc.data() });
    });
    return subUsers;
  } catch (error) {
    console.error('Error al obtener sub-usuarios:', error);
    return [];
  }
};

// Obtener un sub-usuario específico
export const getSubUser = async (accountId, userId) => {
  try {
    const subUserRef = doc(db, `Accounts/${accountId}/SubUsers`, userId);
    const docSnap = await getDoc(subUserRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error al obtener sub-usuario:', error);
    return null;
  }
};

// Actualizar sub-usuario
export const updateSubUser = async (accountId, userId, updateData) => {
  try {
    const subUserRef = doc(db, `Accounts/${accountId}/SubUsers`, userId);
    await updateDoc(subUserRef, updateData);
    return { success: true };
  } catch (error) {
    console.error('Error al actualizar sub-usuario:', error);
    return { success: false, error: error.message };
  }
};

// Eliminar (desactivar) sub-usuario
export const deactivateSubUser = async (accountId, userId) => {
  try {
    const subUserRef = doc(db, `Accounts/${accountId}/SubUsers`, userId);
    await updateDoc(subUserRef, {
      isActive: false,
      deactivatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error al desactivar sub-usuario:', error);
    return { success: false, error: error.message };
  }
};

// Actualizar última actividad del sub-usuario
export const updateLastActive = async (accountId, userId) => {
  try {
    const subUserRef = doc(db, `Accounts/${accountId}/SubUsers`, userId);
    await updateDoc(subUserRef, {
      lastActive: serverTimestamp()
    });
  } catch (error) {
    console.error('Error al actualizar lastActive:', error);
  }
};