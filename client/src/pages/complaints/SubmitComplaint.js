import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import './Complaints.css';

const inputStyle = {
  padding: '0.65rem 0.9rem',
  border: '1.5px solid var(--border)',
  borderRadius: 'var(--radius)',
  fontSize: '0.875rem',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  fontFamily: 'inherit',
  color: 'var(--text-primary)',
  background: 'white',
};

const SubmitComplaint = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]); // { file, preview }
  const [form, setForm] = useState({
    title: '', description: '', category: 'food_quality', priority: 'medium',
    vendor: '', trainNumber: '', stationName: '', pnrNumber: '',
  });

  useEffect(() => {
    api.get('/vendors').then((res) => setVendors(res.data.vendors || [])).catch(() => {});
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 3 - images.length;
    if (remaining <= 0) { toast.error('Maximum 3 images allowed'); return; }

    const newImages = [];
    for (const file of files.slice(0, remaining)) {
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} exceeds 5MB limit`); continue; }
      newImages.push({ file, preview: URL.createObjectURL(file) });
    }
    setImages([...images, ...newImages]);
    e.target.value = '';
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(images[index].preview);
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.description.trim()) { toast.error('Description is required'); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
      images.forEach((img) => formData.append('images', img.file));

      await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Complaint submitted successfully!');
      navigate('/complaints');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const focusStyle = (e) => {
    e.target.style.borderColor = 'var(--primary)';
    e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
  };
  const blurStyle = (e) => {
    e.target.style.borderColor = 'var(--border)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Submit Complaint</h1>
          <p className="page-subtitle">Report a hygiene or service issue</p>
        </div>
      </div>

      <div className="submit-form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Title — full width */}
            <div className="form-group form-full">
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Complaint Title *</label>
              <input
                type="text"
                placeholder="Brief title describing the issue"
                value={form.title}
                onChange={set('title')}
                required
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Category *</label>
              <select value={form.category} onChange={set('category')} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
                <option value="food_quality">Food Quality</option>
                <option value="cleanliness">Cleanliness</option>
                <option value="service">Service</option>
                <option value="pricing">Pricing</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Priority</label>
              <select value={form.priority} onChange={set('priority')} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Vendor (optional)</label>
              <select value={form.vendor} onChange={set('vendor')} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
                <option value="">Select vendor</option>
                {vendors.map((v) => (
                  <option key={v._id} value={v._id}>{v.name} — {v.stationName}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Train Number</label>
              <input type="text" placeholder="e.g. 12301" value={form.trainNumber} onChange={set('trainNumber')} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Station Name</label>
              <input type="text" placeholder="e.g. New Delhi" value={form.stationName} onChange={set('stationName')} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>PNR Number</label>
              <input type="text" placeholder="10-digit PNR" value={form.pnrNumber} onChange={set('pnrNumber')} style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>

            {/* Description — full width */}
            <div className="form-group form-full">
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Description *</label>
              <textarea
                rows={5}
                placeholder="Describe the issue in detail — what happened, when, and where..."
                value={form.description}
                onChange={set('description')}
                required
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>

            {/* Image upload — full width */}
            <div className="form-group form-full">
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Upload Images <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional, max 3 images, 5MB each)</span>
              </label>

              {/* Upload area */}
              <div
                className="image-upload-area"
                onClick={() => images.length < 3 && fileInputRef.current?.click()}
                style={{ cursor: images.length >= 3 ? 'not-allowed' : 'pointer', opacity: images.length >= 3 ? 0.5 : 1 }}
              >
                <FiUpload style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }} />
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Click to upload images
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  JPG, JPEG, PNG, WEBP — max 5MB each
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />

              {/* Image previews */}
              {images.length > 0 && (
                <div className="image-preview-grid">
                  {images.map((img, i) => (
                    <div key={i} className="image-preview-item">
                      <img src={img.preview} alt={`Preview ${i + 1}`} />
                      <button
                        type="button"
                        className="image-remove-btn"
                        onClick={() => removeImage(i)}
                        aria-label="Remove image"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                  {images.length < 3 && (
                    <div
                      className="image-add-more"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FiImage />
                      <span>Add more</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitComplaint;
