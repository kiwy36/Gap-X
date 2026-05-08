import { useState } from 'react';
import './Captcha.css';

const Captcha = ({ onVerify }) => {
  const [verified, setVerified] = useState(false);

  const handleVerify = () => {
    setVerified(true);
    onVerify(true);
  };

  return (
    <div className="captcha-container">
      {!verified ? (
        <button type="button" onClick={handleVerify} className="captcha-button">
          ✓ No soy un robot
        </button>
      ) : (
        <div className="captcha-verified">
          ✓ Verificado
        </div>
      )}
    </div>
  );
};

export default Captcha;