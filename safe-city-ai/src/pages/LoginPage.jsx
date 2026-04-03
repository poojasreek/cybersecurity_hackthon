import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Settings, Lock, Mail, Phone, ChevronRight, Loader2, MapPin } from 'lucide-react';

const LoginPage = () => {
  const [role, setRole] = useState('police');
  const [email, setEmail] = useState('');
  const [officerName, setOfficerName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [password, setPassword] = useState('');
  const [useOtp, setUseOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (role === 'police' && !show2FA) {
        if (!officerName || !branchName || !password) {
          setError('Please fill in all standard details first.');
          setLoading(false);
          return;
        }
        setTimeout(() => {
          setShow2FA(true);
          setLoading(false);
        }, 800);
        return;
      }

      if (role === 'police' && show2FA && otp.length !== 6) {
        setError('Please enter a valid 6-digit authenticator code.');
        setLoading(false);
        return;
      }

      await login(role === 'police' ? 'officer@safecity.ai' : email, password, role);
      
      if (role === 'police') navigate('/fir-management');
      else if (role === 'citizen') navigate('/safety-map');
      else navigate('/admin');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
      setLoading(false);
    }
  };

  const roles = [
    { id: 'police', label: 'Police', icon: Shield, color: '#3A86FF' },
    { id: 'citizen', label: 'Citizen', icon: User, color: '#2ECC71' },
    { id: 'admin', label: 'Admin', icon: Settings, color: '#8B5CF6' },
  ];

  return (
    <div className="login-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'radial-gradient(circle at center, #1C2541 0%, #0B132B 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
          x: [0, 50, 0],
          y: [0, 30, 0]
        }}
        transition={{ duration: 10, repeat: Infinity }}
        style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'var(--primary-color)',
          filter: 'blur(100px)',
          zIndex: 0
        }}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '450px',
          padding: '40px',
          position: 'relative',
          zIndex: 1,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #3A86FF 0%, #00B4D8 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 10px 25px rgba(58, 134, 255, 0.4)',
              transform: 'perspective(500px) rotateX(10deg)'
            }}
          >
            <Shield size={40} color="white" />
          </motion.div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '8px' }}>
            SAFE-CITY <span style={{ color: 'var(--primary-color)' }}>AI</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Secure Intelligent Surveillance & Response</p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', 
            background: 'rgba(0,0,0,0.2)', 
            borderRadius: '12px', 
            padding: '4px',
            marginBottom: '24px'
          }}>
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => { 
                  setRole(r.id); 
                  setShow2FA(false);
                  setPassword('');
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '12px 8px',
                  borderRadius: '8px',
                  background: role === r.id ? 'var(--panel-bg)' : 'transparent',
                  color: role === r.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: role === r.id ? '1px solid var(--border-color)' : '1px solid transparent',
                  boxShadow: role === r.id ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
                }}
              >
                <r.icon size={20} style={{ marginBottom: '4px', color: role === r.id ? r.color : 'inherit' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{r.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin}>
            <AnimatePresence mode="wait">
              {!show2FA ? (
                role === 'police' ? (
                  <motion.div
                    key="police-fields"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Officer Name</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                          <User size={18} />
                        </span>
                        <input
                          type="text"
                          required
                          value={officerName}
                          onChange={(e) => setOfficerName(e.target.value)}
                          placeholder="e.g. SI Rajesh Kumar"
                          style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', outline: 'none', transition: 'border-color 0.3s' }}
                        />
                      </div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Branch Name / Station Phase</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                          <MapPin size={18} />
                        </span>
                        <input
                          type="text"
                          required
                          value={branchName}
                          onChange={(e) => setBranchName(e.target.value)}
                          placeholder="e.g. T. Nagar Branch"
                          style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', outline: 'none', transition: 'border-color 0.3s' }}
                        />
                      </div>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Access Password</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                          <Lock size={18} />
                        </span>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', outline: 'none', transition: 'border-color 0.3s' }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="general-fields"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                        {role === 'citizen' && useOtp ? 'Phone Number' : 'Email Address'}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                          {role === 'citizen' && useOtp ? <Phone size={18} /> : <Mail size={18} />}
                        </span>
                        <input
                          type={role === 'citizen' && useOtp ? 'tel' : 'email'}
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={role === 'citizen' && useOtp ? '+91 XXXX XXX XXX' : 'citizen@safecity.ai'}
                          style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', outline: 'none', transition: 'border-color 0.3s' }}
                        />
                      </div>
                    </div>

                    {!useOtp && (
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Password</label>
                          <a href="#" style={{ fontSize: '0.8rem', color: 'var(--primary-color)', textDecoration: 'none' }}>Forgot?</a>
                        </div>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>
                            <Lock size={18} />
                          </span>
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', outline: 'none' }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              ) : (
                <motion.div
                  key="2fa-fields"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                    <Shield size={32} color="var(--primary-color)" style={{ marginBottom: '12px' }} />
                    <h3 style={{ marginBottom: '8px' }}>Security Verification</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Enter the 6-digit code from your Authenticator app</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
                    <input
                      type="text"
                      maxLength="6"
                      required
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setOtp(val);
                      }}
                      placeholder="······"
                      autoFocus
                      style={{
                        width: '100%', maxWidth: '240px', padding: '16px', textAlign: 'center', fontSize: '2rem',
                        letterSpacing: '12px', background: 'rgba(0,0,0,0.3)', border: '2px solid var(--primary-color)',
                        borderRadius: '16px', color: 'white', outline: 'none', boxShadow: '0 0 20px rgba(58, 134, 255, 0.2)',
                        fontWeight: '800'
                      }}
                    />
                  </div>
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Didn't get the code? <button type="button" style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: 0, fontWeight: '600' }}>Use Backup Key</button>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && <p style={{ color: '#FF4D4F', fontSize: '0.8rem', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%', padding: '14px', fontSize: '1rem', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px'
              }}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  {show2FA ? 'Verify Identity' : (role === 'police' && !show2FA) ? 'Continue to Verification' : 'Login to Dashboard'}
                  <ChevronRight size={18} />
                </>
              )}
            </button>

            {role === 'citizen' && (
              <button
                type="button"
                onClick={() => setUseOtp(!useOtp)}
                style={{ width: '100%', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'none', border: 'none' }}
              >
                Switch to {useOtp ? 'Email/Password' : 'Phone OTP'} login
              </button>
            )}
            
            {show2FA && (
              <button
                type="button"
                onClick={() => setShow2FA(false)}
                style={{ width: '100%', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Back to credentials
              </button>
            )}
          </form>
        </div>
      </motion.div>
      
      <div style={{ position: 'absolute', bottom: '20px', display: 'flex', gap: '24px', opacity: 0.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
        <span>End-to-End Encrypted</span>
        <span>BC Protected</span>
        <span>24/7 Monitoring</span>
      </div>
    </div>
  );
};

export default LoginPage;
