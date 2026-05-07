// src/services/accountService.js
import { db, auth } from '../firebase';
// eslint-disable-next-line no-unused-vars
import { doc, setDoc, getDoc, getDocs, collection, query, where, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';

// Crear una nueva cuenta (solo para administrador)
export const createAccount = async (accountId, adminId, adminEmail, empresaNombre) => {
  try {
    const accountRef = doc(db, 'Accounts', accountId);
    await setDoc(accountRef, {
      adminId: adminId,
      adminEmail: adminEmail,
      nombreEmpresa: empresaNombre,
      fechaCreacion: serverTimestamp(),
      plan: 'basic'
    });
    return { success: true, accountId };
  } catch (error) {
    console.error('Error al crear cuenta:', error);
    return { success: false, error: error.message };
  }
};

// Obtener cuenta por adminId
export const getAccountByAdminId = async (adminId) => {
  try {
    const accountsRef = collection(db, 'Accounts');
    const q = query(accountsRef, where('adminId', '==', adminId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error al obtener cuenta:', error);
    return null;
  }
};

// Verificar si el usuario actual es administrador
export const isAdmin = async () => {
  if (!auth.currentUser) return false;
  
  try {
    const accountDoc = await getAccountByAdminId(auth.currentUser.uid);
    return accountDoc !== null;
  } catch (error) {
    console.error('Error al verificar admin:', error);
    return false;
  }
};

// Obtener cuenta actual del usuario (admin o sub-usuario)
export const getCurrentAccount = async () => {
  if (!auth.currentUser) return null;
  
  try {
    // Primero verificar si es admin
    const adminAccount = await getAccountByAdminId(auth.currentUser.uid);
    if (adminAccount) return { ...adminAccount, role: 'admin' };
    
    // Si no es admin, buscar en sub-usuarios
    const accountsRef = collection(db, 'Accounts');
    const accountsSnapshot = await getDocs(accountsRef);
    
    for (const accountDoc of accountsSnapshot.docs) {
      const subUserRef = doc(db, `Accounts/${accountDoc.id}/SubUsers/${auth.currentUser.uid}`);
      const subUserDoc = await getDoc(subUserRef);
      
      if (subUserDoc.exists()) {
        return { 
          id: accountDoc.id, 
          ...accountDoc.data(), 
          role: 'subuser',
          subUserData: subUserDoc.data()
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error al obtener cuenta actual:', error);
    return null;
  }
};