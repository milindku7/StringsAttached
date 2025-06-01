import React, { useState } from 'react';
import "../styles/Password.css"

const ResetPasswordModal = ({ show, onClose }) => {
  const [email, setEmail] = useState('');
  const [gotToken, setGotToken] = useState(false);
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);


  const handleResetRequest = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(process.env.REACT_APP_API_PATH + "/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setGotToken(true);
      } else {
        setError('Failed to send reset email');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(process.env.REACT_APP_API_PATH + "/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (response.ok) {
        setResetSuccess(true);
        setTimeout(() => {
          setEmail('');
          setGotToken(false);
          setToken('');
          setPassword('');
          setError('');
          setResetSuccess(false);
          onClose();
          window.close();
        }, 3000);
        


      } else {
        setError('Invalid token or password');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
      <button
  className="modal-close"
  onClick={() => {
    setEmail('');
    setGotToken(false);
    setToken('');
    setPassword('');
    setError('');
    setResetSuccess(false);
    onClose();
  }}
>
  ×
</button>
        <h2 style={{ 
  fontSize: '2.0rem', // Reduced from 2rem+
  marginBottom: '1rem',
  color: 'black',
  fontFamily: 'JetBrains Mono'
}}>
  Reset Password
</h2>
        
        {error && <div className="error-message">{error}</div>}
        {resetSuccess && (
  <div style={{
    marginBottom: "1rem",
    padding: "10px",
    backgroundColor: "#dff0d8",
    color: "#3c763d",
    borderRadius: "6px",
    textAlign: "center"
  }}>
    Password reset successfully! This tab will close shortly.
  </div>
)}

        {!gotToken ? (
          <form onSubmit={handleResetRequest}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="submit-button">
              Send Reset Link
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>Reset Token</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="submit-button">
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordModal;