import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Filter, FileText, Clock, MapPin, User, 
  Briefcase, MessageSquare, AlertTriangle, ChevronDown, 
  Download, CheckCircle, XCircle, Database, ChevronUp, ChevronsUpDown, Upload
} from 'lucide-react';
import { firRecords, crimeTypes, statusTypes } from '../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';

const specificCrimeTypes = ['IPC', 'NDPS', 'Women Safety', 'Accident'];

const FIRManagementPage = () => {
  const [records, setRecords] = useState(firRecords);
  const [showNewFIR, setShowNewFIR] = useState(false);
  const [newFIR, setNewFIR] = useState({
    crimeType: 'IPC',
    location: '',
    description: '',
    severity: 'medium',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
  const [attachment, setAttachment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  
  // Sorting & Pagination
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [selectedFIR, setSelectedFIR] = useState(null);

  const handleAddFIR = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const newRecord = {
        id: `FIR-2026-0${records.length + 20}`,
        crimeType: newFIR.crimeType,
        location: newFIR.location,
        description: newFIR.description,
        date: newFIR.date,
        time: newFIR.time,
        status: 'Open',
        severity: newFIR.severity,
        officer: 'Current Officer'
      };
      
      setRecords([newRecord, ...records]);
      setIsSubmitting(false);
      setShowNewFIR(false);
      setNewFIR({
        crimeType: 'IPC', location: '', description: '', severity: 'medium',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setAttachment(null);
    }, 1200);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const processedRecords = useMemo(() => {
    let filtered = records.filter(f => 
      (f.id.toLowerCase().includes(searchTerm.toLowerCase()) || f.location.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedType === 'All' || f.crimeType === selectedType) &&
      (selectedStatus === 'All' || f.status === selectedStatus) &&
      (filterDate === '' || f.date === filterDate)
    );

    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [records, searchTerm, selectedType, selectedStatus, filterDate, sortConfig]);

  const totalPages = Math.ceil(processedRecords.length / itemsPerPage);
  const currentRecords = processedRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ChevronsUpDown size={14} style={{ opacity: 0.3 }} />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selectedFIR ? '1fr 400px' : '1fr', gap: '24px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      
      <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
           <div>
             <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '8px' }}>FIR Records Inventory</h2>
             <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Managing {records.length} total digital records</p>
           </div>
           <button 
             onClick={() => setShowNewFIR(true)}
             className="btn-primary" 
             style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
           >
             <Plus size={18} /> New Digital FIR
           </button>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
           <div style={{ 
             flex: 1, 
             minWidth: '200px', 
             padding: '4px 12px', 
             background: 'rgba(0,0,0,0.2)', 
             borderRadius: '12px', 
             border: '1px solid var(--border-color)',
             display: 'flex',
             alignItems: 'center',
             gap: '12px'
           }}>
             <Search size={18} color="var(--text-secondary)" />
             <input 
               type="text" 
               placeholder="Search by ID or Location..." 
               value={searchTerm}
               onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
               style={{ background: 'none', border: 'none', color: 'white', width: '100%', padding: '10px 0', outline: 'none' }}
             />
           </div>
           
           <div style={{ display: 'flex', gap: '12px' }}>
             <input
               type="date"
               value={filterDate}
               onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
               className="glass-panel"
               style={{ padding: '0 16px', background: 'var(--panel-bg)', borderRadius: '12px', fontSize: '0.85rem', outline: 'none', border: '1px solid var(--border-color)', color: 'white' }}
             />
             <select 
               className="glass-panel" 
               style={{ padding: '0 16px', background: 'var(--panel-bg)', borderRadius: '12px', fontSize: '0.85rem', color: 'white', outline: 'none' }}
               value={selectedType}
               onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
             >
               <option value="All">All Crimes</option>
               {specificCrimeTypes.map(t => <option key={t} value={t}>{t}</option>)}
             </select>
             <select 
               className="glass-panel" 
               style={{ padding: '0 16px', background: 'var(--panel-bg)', borderRadius: '12px', fontSize: '0.85rem', color: 'white', outline: 'none' }}
               value={selectedStatus}
               onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
             >
               <option value="All">All Statuses</option>
               {statusTypes.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
           </div>
        </div>

        {/* Table Header */}
        <div style={{ 
          display: 'grid', gridTemplateColumns: '120px 1fr 150px 150px 100px', gap: '16px', 
          padding: '0 24px 8px', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid var(--border-color)' 
        }}>
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleSort('id')}>FIR ID <SortIcon column="id" /></div>
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleSort('crimeType')}>Crime Type <SortIcon column="crimeType" /></div>
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleSort('location')}>Location <SortIcon column="location" /></div>
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleSort('date')}>Date/Time <SortIcon column="date" /></div>
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleSort('status')}>Status <SortIcon column="status" /></div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '400px' }}>
          {currentRecords.map((fir, idx) => (
             <motion.div
               key={fir.id}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.03 }}
               onClick={() => setSelectedFIR(fir)}
               style={{
                 padding: '16px 24px',
                 borderRadius: '16px',
                 background: selectedFIR?.id === fir.id ? '#1C2541' : 'transparent',
                 border: `1px solid ${selectedFIR?.id === fir.id ? 'var(--primary-color)' : 'transparent'}`,
                 cursor: 'pointer',
                 display: 'grid',
                 gridTemplateColumns: '120px 1fr 150px 150px 100px',
                 gap: '16px',
                 alignItems: 'center',
                 transition: 'all 0.2s'
               }}
               onMouseEnter={(e) => { if (selectedFIR?.id !== fir.id) e.currentTarget.style.background = '#1C2541'; }}
               onMouseLeave={(e) => { if (selectedFIR?.id !== fir.id) e.currentTarget.style.background = 'transparent'; }}
             >
                <div style={{ fontSize: '0.9rem', fontWeight: '800' }}>{fir.id}</div>
                <div>
                   <span style={{ 
                     fontSize: '0.7rem', padding: '4px 10px', borderRadius: '6px', fontWeight: '800',
                     background: fir.severity === 'high' ? 'rgba(255,77,79,0.1)' : 'rgba(58,134,255,0.1)',
                     color: fir.severity === 'high' ? '#FF4D4F' : '#3A86FF',
                    }}>{fir.crimeType}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                  <MapPin size={14} color="var(--text-secondary)" />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fir.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                  <Clock size={14} color="var(--text-secondary)" />
                  {fir.date}
                </div>
                <div style={{ 
                  fontSize: '0.8rem', fontWeight: '800', 
                  color: fir.status === 'Resolved' ? '#2ECC71' : fir.status === 'Open' ? '#FFD60A' : '#3A86FF' 
                }}>
                  {fir.status}
                </div>
             </motion.div>
          ))}
          {processedRecords.length === 0 && (
             <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)', marginTop: '40px' }}>
                <Search size={48} style={{ marginBottom: '12px', opacity: 0.2, margin: '0 auto' }} />
                <p>No matching digital records found.</p>
             </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
             <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, processedRecords.length)} of {processedRecords.length} records
             </p>
             <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="glass-panel" style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', disabled: currentPage === 1 ? 'true' : 'false', opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  Prev
                </button>
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '0.85rem', fontWeight: '700' }}>
                   {currentPage} / {totalPages}
                </div>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="glass-panel" style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                  Next
                </button>
             </div>
          </div>
        )}
      </div>

      {/* FIR Detail Panel */}
      <AnimatePresence>
        {selectedFIR && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="glass-panel"
            style={{ padding: '32px', position: 'sticky', top: '100px', height: 'fit-content', borderLeft: `6px solid ${selectedFIR.severity === 'high' ? '#FF4D4F' : selectedFIR.severity === 'medium' ? '#FFD60A' : '#2ECC71'}` }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
               <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Record Analysis</h3>
               <button onClick={() => setSelectedFIR(null)} style={{ color: 'var(--text-secondary)', cursor: 'pointer', background: 'none', border: 'none' }}>
                 <XCircle size={20} />
               </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
               <div style={{
                 width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(58,134,255,0.1)',
                 display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)'
               }}>
                 <FileText size={28} color="var(--primary-color)" />
               </div>
               <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Digital {selectedFIR.id}</p>
                  <p style={{ fontSize: '1rem', fontWeight: '700' }}>0x8a4fe2...d43b</p>
               </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Reporting Officer</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1C2541', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={16} />
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{selectedFIR.officer}</span>
                  </div>
               </div>

               <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Incident Description</p>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.6', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
                    {selectedFIR.description || "No extensive details recorded for this physical entry."}
                  </p>
               </div>
               
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(58,134,255,0.05)', borderRadius: '10px', border: '1px dashed rgba(58,134,255,0.3)', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} color="var(--primary-color)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary-color)' }}>View in Hotspot Map</span>
                  </div>
                  <ChevronDown size={16} color="var(--primary-color)" style={{ transform: 'rotate(-90deg)' }} />
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="glass-panel" style={{ padding: '12px', textAlign: 'center' }}>
                     <AlertTriangle size={18} color={selectedFIR.severity === 'high' ? '#FF4D4F' : selectedFIR.severity === 'medium' ? '#FFD60A' : '#2ECC71'} style={{ marginBottom: '4px' }} />
                     <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Priority / Severity</p>
                     <p style={{ fontWeight: '800', color: selectedFIR.severity === 'high' ? '#FF4D4F' : 'inherit' }}>
                       {selectedFIR.severity.toUpperCase()}
                     </p>
                  </div>
                  <div className="glass-panel" style={{ padding: '12px', textAlign: 'center' }}>
                     <Database size={18} color={selectedFIR.status === 'Resolved' ? '#2ECC71' : '#3A86FF'} style={{ marginBottom: '4px' }} />
                     <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Status</p>
                     <p style={{ fontWeight: '800' }}>{selectedFIR.status.toUpperCase()}</p>
                  </div>
               </div>

               <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                  <button className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Briefcase size={16} /> Update Case
                  </button>
                  <button style={{ padding: '12px', borderRadius: '8px', background: 'var(--panel-bg)', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                    <Download size={18} />
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* New FIR Modal Overlay */}
      <AnimatePresence>
        {showNewFIR && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
            zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel"
              style={{ width: '100%', maxWidth: '600px', padding: '40px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <button 
                onClick={() => setShowNewFIR(false)}
                style={{ position: 'absolute', right: '20px', top: '20px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <XCircle size={24} />
              </button>
              
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Plus size={24} color="var(--primary-color)" /> Create Digital FIR record
              </h2>
              
              <form onSubmit={handleAddFIR} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Crime Type</label>
                  <select 
                    value={newFIR.crimeType} 
                    onChange={e => setNewFIR({...newFIR, crimeType: e.target.value})}
                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', outline: 'none' }}
                  >
                    {specificCrimeTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Location / GPS Map Pin</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input 
                      required type="text" placeholder="e.g. Anna Nagar, Sector 4"
                      value={newFIR.location} 
                      onChange={e => setNewFIR({...newFIR, location: e.target.value})}
                      style={{ flex: 1, padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', outline: 'none' }}
                    />
                    <button type="button" style={{ padding: '0 16px', borderRadius: '10px', background: 'rgba(58,134,255,0.1)', border: '1px solid rgba(58,134,255,0.3)', color: '#3A86FF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <MapPin size={16} /> Pin
                    </button>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', gridColumn: 'span 2' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Date (Auto-filled)</label>
                    <input 
                      type="date"
                      value={newFIR.date} 
                      disabled
                      style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-secondary)', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Time (Auto-filled)</label>
                    <input 
                      type="time"
                      value={newFIR.time} 
                      disabled
                      style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-secondary)', outline: 'none' }}
                    />
                  </div>
                </div>
                
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Attachments (Image/Video)</label>
                  <label style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                    width: '100%', padding: '24px 12px', background: 'rgba(0,0,0,0.2)', border: '1px dashed var(--primary-color)', borderRadius: '10px', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(58,134,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
                  >
                    <Upload size={24} color={attachment ? '#2ECC71' : "var(--primary-color)"} />
                    <span style={{ fontSize: '0.85rem', color: attachment ? '#2ECC71' : 'var(--text-secondary)' }}>
                      {attachment ? attachment.name : 'Click or drag files to upload...'}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*,video/*"
                      onChange={e => setAttachment(e.target.files[0])}
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Severity</label>
                  <select 
                    value={newFIR.severity} 
                    onChange={e => setNewFIR({...newFIR, severity: e.target.value})}
                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', outline: 'none' }}
                  >
                    <option value="low">Green (Routine / Resolved)</option>
                    <option value="medium">Yellow (Medium Risk)</option>
                    <option value="high">Red (High / Critical)</option>
                  </select>
                </div>
                
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Incident Description</label>
                  <textarea 
                    rows="4" 
                    value={newFIR.description} 
                    onChange={e => setNewFIR({...newFIR, description: e.target.value})}
                    placeholder="Enter full details of the incident..."
                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'white', outline: 'none', resize: 'none' }}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={isSubmitting}
                  style={{ gridColumn: 'span 2', padding: '16px', fontSize: '1rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? 'Registering on Blockchain...' : 'Submit Digital FIR'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FIRManagementPage;
