import { useState } from 'react';
import { auth } from '../../services/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import Swal from 'sweetalert2';
import './ForgotPassword.css';
//arreglar problema aqui
const ForgotPassword = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Swal.fire('Error', 'Por favor ingresa tu correo electrónico', 'error');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Swal.fire({
        title: 'Correo enviado',
        text: 'Revisa tu bandeja de entrada para restablecer tu contraseña',
        icon: 'success'
      });
      onClose();
    } catch (error) {
      console.error('Error al enviar correo:', error);
      Swal.fire('Error', 'No se pudo enviar el correo. Verifica tu dirección de email.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-modal">
      <div className="forgot-password-content">
        <h3>Recuperar Contraseña</h3>
        <input
          type="email"
          placeholder="Ingresa tu correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
        />
        <div className="modal-buttons">
          <button onClick={handleResetPassword} disabled={loading} className="reset-button">
            {loading ? 'Enviando...' : 'Enviar correo'}
          </button>
          <button onClick={onClose} className="cancel-button">Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;