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
  const [otp, setOtp] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, verify2FA } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!show2FA) {
        // Step 1: Login
        const credentials = role === 'police' 
          ? { role, password, officer_name: officerName, branch_name: branchName }
          : { role, password, email };

        const response = await login(credentials);
        
        if (response.needs_2fa) {
          setShow2FA(true);
          setLoading(false);
        } else {
          // Direct login for non-police
          await verify2FA({ email, role, code: "000000" }); // Mock verification if skipped
          navigate(role === 'citizen' ? '/safety-map' : '/admin');
        }
      } else {
        // Step 2: 2FA
        await verify2FA({ email, role, code: otp });
        navigate('/fir-management');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
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
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', background: 'radial-gradient(circle at center, #1C2541 0%, #0B132B 100%)',
      position: 'relative', overflow: 'hidden'
    }}>
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 10, repeat: Infinity }} style={{ position: 'absolute', top: '10%', left: '10%', width: '400px', height: '400px', borderRadius: '50%', background: 'var(--primary-color)', filter: 'blur(100px)', zIndex: 0 }} />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '40px', position: 'relative', zIndex: 1, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #3A86FF 0%, #00B4D8 100%)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 10px 25px rgba(58, 134, 255, 0.4)' }}>
            <Shield size={40} color="white" />
          </motion.div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.5px' }}>SAFE-CITY <span style={{ color: 'var(--primary-color)' }}>AI</span></h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Secure Intelligent Response Ecosystem</p>
        </div>

        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
          {roles.map((r) => (
            <button key={r.id} type="button" onClick={() => { setRole(r.id); setShow2FA(false); setOtp(''); }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 8px', borderRadius: '8px', background: role === r.id ? 'var(--panel-bg)' : 'transparent', color: role === r.id ? 'var(--text-primary)' : 'var(--text-secondary)', border: role === r.id ? '1px solid var(--border-color)' : '1px solid transparent' }}
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
                <motion.div key="police" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Officer Name</label>
                    <input required className="glass-panel" style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }} value={officerName} onChange={e => setOfficerName(e.target.value)} placeholder="SI Rajesh Kumar" />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Branch Name</label>
                    <input required className="glass-panel" style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }} value={branchName} onChange={e => setBranchName(e.target.value)} placeholder="T. Nagar Branch" />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Password</label>
                    <input required type="password" className="glass-panel" style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                  </div>
                </motion.div>
              ) : (
                <motion.div key="user" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Email</label>
                    <input required type="email" className="glass-panel" style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }} value={email} onChange={e => setEmail(e.target.value)} placeholder="citizen@safecity.ai" />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Password</label>
                    <input required type="password" className="glass-panel" style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                  </div>
                </motion.div>
              )
            ) : (
              <motion.div key="2fa" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ textAlign: 'center' }}>
                <Shield size={42} color="var(--primary-color)" style={{ marginBottom: '16px' }} />
                <h3 style={{ marginBottom: '8px' }}>MFA Verification</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>Enter the 6-digit Google Authenticator Code</p>
                <input required type="text" maxLength="6" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} style={{ width: '100%', maxWidth: '240px', padding: '16px', textAlign: 'center', fontSize: '2rem', letterSpacing: '8px', background: 'rgba(0,0,0,0.3)', border: '2px solid var(--primary-color)', borderRadius: '12px', color: 'white', outline: 'none' }} placeholder="000000" />
                <button type="button" onClick={() => setShow2FA(false)} style={{ display: 'block', margin: '20px auto 0', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Back to login</button>
              </motion.div>
            )}
          </AnimatePresence>

          {error && <p style={{ color: '#FF4D4F', fontSize: '0.8rem', marginTop: '16px', textAlign: 'center' }}>{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '24px', padding: '14px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <> {show2FA ? 'Verify Code' : 'Continue'} <ChevronRight size={18} /> </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
