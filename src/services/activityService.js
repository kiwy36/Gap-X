// src/services/activityService.js
import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';

// Registrar actividad (desde tu código React)
export const logActivity = async (accountId, userId, action, collection, documentId, additionalData = {}) => {
  try {
    const activityRef = collection(db, `Accounts/${accountId}/SubUsers/${userId}/Activity`);
    await addDoc(activityRef, {
      userId: userId,
      userEmail: auth.currentUser?.email || 'unknown',
      action: action,
      collection: collection,
      documentId: documentId,
      timestamp: serverTimestamp(),
      ...additionalData
    });
    return { success: true };
  } catch (error) {
    console.error('Error al registrar actividad:', error);
    return { success: false, error: error.message };
  }
};

// Obtener actividades de un sub-usuario
export const getUserActivities = async (accountId, userId, limitCount = 50) => {
  try {
    const activityRef = collection(db, `Accounts/${accountId}/SubUsers/${userId}/Activity`);
    const q = query(activityRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    const activities = [];
    snapshot.forEach(doc => {
      activities.push({ id: doc.id, ...doc.data() });
    });
    return activities;
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    return [];
  }
};