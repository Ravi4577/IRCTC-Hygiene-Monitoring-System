import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../context/AuthContext';
import '../complaints/Complaints.css';
import './Inspections.css';

const CHECKLIST_FIELDS = ['foodStorage', 'cookingArea', 'servingArea', 'staffHygiene', 'wasteManagement', 'pestControl', 'waterQuality', 'documentation'];

const InspectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [completeForm, setCompleteForm] = useState({
    checklist: Object.fromEntries(CHECKLIST_FIELDS.map(f => [f, 5])),
    findings: '', recommendations: '', followUpRequired: false,
  });

  useEffect(() => {
    api.get(`/inspections/${id}`)
      .then((res) => setInspection(res.data.inspection))
      .catch(() => navigate('/inspections'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleComplete = async (e) => {
    e.preventDefault();
    setCompleting(true);
    try {
      const res = await api.patch(`/inspections/${id}/complete`, completeForm);
      setInspection(res.data.inspection);
      setShowCompleteForm(false);
      toast.success('Inspection completed!');
    } catch { toast.error('Failed to complete inspection'); }
    finally { setCompleting(false); }
  };

  if (loading) return <Spinner center size="lg" />;
  if (!inspection) return null;

  return (
    <div className="page-container">
      <button className="btn-link" onClick={() => navigate('/inspections')}>← Back to Inspections</button>

      <div className="detail-card">
        <div className="detail-header">
          <div>
            <div className="detail-title">Inspection — {inspection.vendor?.name}</div>
            <div className="detail-badges">
              <Badge label={inspection.status} type={inspection.status} />
              <Badge label={inspection.type?.replace('_', ' ')} type="default" />
              {inspection.grade && <span className={`grade grade-${inspection.grade}`}>{inspection.grade}</span>}
            </div>
          </div>
          {inspection.overallScore !== undefined && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{inspection.overallScore}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>/ 100</div>
            </div>
          )}
        </div>

        <div className="detail-meta">
          <div className="meta-item"><label>Inspector</label><span>{inspection.inspector?.name}</span></div>
          <div className="meta-item"><label>Station</label><span>{inspection.stationName || '—'}</span></div>
          <div className="meta-item"><label>Scheduled</label><span>{new Date(inspection.scheduledDate).toLocaleDateString()}</span></div>
          {inspection.completedDate && <div className="meta-item"><label>Completed</label><span>{new Date(inspection.completedDate).toLocaleDateString()}</span></div>}
        </div>

        {inspection.checklist && Object.keys(inspection.checklist).length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>Checklist Scores</h4>
            <div className="checklist-grid">
              {CHECKLIST_FIELDS.map((f) => (
                <div key={f} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg)', borderRadius: 'var(--radius)' }}>
                  <span style={{ fontSize: '0.8rem', textTransform: 'capitalize' }}>{f.replace(/([A-Z])/g, ' $1')}</span>
                  <strong style={{ fontSize: '0.8rem' }}>{inspection.checklist[f] ?? '—'}/10</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {inspection.findings && (
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Findings</h4>
            <div className="detail-description">{inspection.findings}</div>
          </div>
        )}

        {inspection.recommendations && (
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Recommendations</h4>
            <div className="detail-description">{inspection.recommendations}</div>
          </div>
        )}
      </div>

      {/* Complete inspection form */}
      {user?.role === 'officer' && inspection.status === 'scheduled' && (
        <div className="detail-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Complete Inspection</h3>
            <button className="btn-primary" onClick={() => setShowCompleteForm(!showCompleteForm)}>
              {showCompleteForm ? 'Cancel' : 'Fill Checklist'}
            </button>
          </div>

          {showCompleteForm && (
            <form onSubmit={handleComplete}>
              <div className="checklist-grid" style={{ marginBottom: '1rem' }}>
                {CHECKLIST_FIELDS.map((f) => (
                  <div key={f} className="checklist-item">
                    <label>{f.replace(/([A-Z])/g, ' $1')}</label>
                    <input
                      type="number" min={0} max={10}
                      value={completeForm.checklist[f]}
                      onChange={(e) => setCompleteForm({ ...completeForm, checklist: { ...completeForm.checklist, [f]: Number(e.target.value) } })}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Findings</label>
                  <textarea rows={3} value={completeForm.findings} onChange={(e) => setCompleteForm({ ...completeForm, findings: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', resize: 'vertical', outline: 'none', fontSize: '0.875rem' }} />
                </div>
                <div className="form-group">
                  <label>Recommendations</label>
                  <textarea rows={3} value={completeForm.recommendations} onChange={(e) => setCompleteForm({ ...completeForm, recommendations: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', resize: 'vertical', outline: 'none', fontSize: '0.875rem' }} />
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={completing}>
                {completing ? 'Completing...' : 'Mark as Completed'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default InspectionDetail;
