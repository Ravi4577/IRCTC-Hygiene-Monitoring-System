import React, { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';
import './Pnr.css';

const PnrPage = () => {
  const [pnr, setPnr] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    api.get('/pnr/history')
      .then((res) => setHistory(res.data.history || []))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!pnr.trim()) { toast.error('Enter a PNR number'); return; }
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/pnr/verify', { pnrNumber: pnr });
      setResult(res.data);
      if (res.data.isVerified) toast.success('PNR verified successfully!');
      else toast.error('Invalid PNR number');
    } catch { toast.error('Verification failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">PNR Verification</h1>
          <p className="page-subtitle">Verify your train ticket PNR number</p>
        </div>
      </div>

      <div className="pnr-card">
        <div className="pnr-card-title">Enter PNR Number</div>
        <p className="pnr-hint">
          Try demo PNRs: <code>1234567890</code> or <code>9876543210</code>
        </p>
        <form onSubmit={handleVerify} className="pnr-form">
          <input
            type="text"
            placeholder="10-digit PNR"
            value={pnr}
            onChange={(e) => setPnr(e.target.value.replace(/\D/g, '').slice(0, 10))}
            maxLength={10}
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            <FiSearch /> {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        {result && (
          <div className={`pnr-result ${result.isVerified ? 'verified' : 'invalid'}`}>
            {result.isVerified ? (
              <>
                <div className="pnr-result-header">✅ PNR Verified Successfully</div>
                <div className="pnr-details">
                  <div className="pnr-detail-item"><label>Train</label><span>{result.data.trainName}</span></div>
                  <div className="pnr-detail-item"><label>Train No.</label><span>{result.data.trainNumber}</span></div>
                  <div className="pnr-detail-item"><label>From</label><span>{result.data.fromStation}</span></div>
                  <div className="pnr-detail-item"><label>To</label><span>{result.data.toStation}</span></div>
                  <div className="pnr-detail-item"><label>Class</label><span>{result.data.seatClass}</span></div>
                  <div className="pnr-detail-item">
                    <label>Status</label>
                    <span><Badge label={result.data.status} type="success" /></span>
                  </div>
                </div>
              </>
            ) : (
              <div className="pnr-result-header">❌ Invalid PNR — No record found</div>
            )}
          </div>
        )}
      </div>

      {/* History */}
      {historyLoading ? <Spinner center /> : history.length > 0 && (
        <div className="detail-card">
          <div className="section-header">
            <span className="section-title">Recent Verifications</span>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>PNR</th><th>Train</th><th>Route</th><th>Status</th><th>Verified At</th></tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h._id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.05em' }}>{h.pnrNumber}</td>
                    <td>{h.trainName || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {h.fromStation && h.toStation ? `${h.fromStation} → ${h.toStation}` : '—'}
                    </td>
                    <td><Badge label={h.isVerified ? 'verified' : 'invalid'} type={h.isVerified ? 'verified' : 'invalid'} /></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{new Date(h.verifiedAt || h.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PnrPage;
