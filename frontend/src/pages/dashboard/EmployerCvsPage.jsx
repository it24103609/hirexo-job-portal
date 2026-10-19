import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  BriefcaseBusiness,
  Download,
  Eye,
  FileText,
  Inbox,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  UploadCloud,
  X
} from 'lucide-react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Button from '../../components/ui/Button';
import { employerApi } from '../../services/employer.api';
import { applicationsApi } from '../../services/applications.api';
import { formatDate } from '../../utils/formatters';
import './EmployerCvsPage.css';

const MAX_CV_SIZE = 10 * 1024 * 1024;

function formatSize(size) {
  const bytes = Number(size);
  if (!Number.isFinite(bytes) || bytes <= 0) return 'Size unavailable';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getInitials(name) {
  return String(name || 'Candidate')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

function cvKey(item) {
  return `${item.source}-${item.id}`;
}

export default function EmployerCvsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [name, setName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyItem, setBusyItem] = useState('');
  const [deletingItem, setDeletingItem] = useState('');
  const fileInputRef = useRef(null);
  const requestIdRef = useRef(0);
  const objectUrlsRef = useRef(new Set());
  const timersRef = useRef(new Set());

  const loadCvs = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setLoadError('');

    try {
      const response = await employerApi.cvs();
      if (requestId === requestIdRef.current) {
        setItems(Array.isArray(response.data?.items) ? response.data.items : []);
      }
    } catch (error) {
      if (requestId === requestIdRef.current) {
        setLoadError(error.message || 'Could not load CVs.');
      }
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCvs();
    return () => {
      requestIdRef.current += 1;
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current.clear();
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current.clear();
    };
  }, [loadCvs]);

  const applicationCount = items.filter((item) => item.source === 'application').length;
  const uploadedCount = items.filter((item) => item.source === 'uploaded').length;

  const visibleItems = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items.filter((item) => {
      if (sourceFilter !== 'all' && item.source !== sourceFilter) return false;
      if (!term) return true;
      return [item.name, item.email, item.phone, item.jobTitle, item.fileName]
        .some((value) => String(value || '').toLowerCase().includes(term));
    });
  }, [items, query, sourceFilter]);

  const pickFile = (picked) => {
    if (!picked) return;
    setFile(null);
    if (!/\.pdf$/i.test(picked.name) || (picked.type && picked.type !== 'application/pdf')) {
      toast.error('Choose a PDF file.');
      return;
    }
    if (picked.size > MAX_CV_SIZE) {
      toast.error('The PDF must be 10 MB or smaller.');
      return;
    }
    setFile(picked);
  };

  const uploadCv = async (event) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error('Enter the candidate name.');
      return;
    }
    if (!file) {
      toast.error('Choose a PDF CV to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('cv', file);
    formData.append('name', name.trim());
    formData.append('jobTitle', jobTitle.trim());
    formData.append('email', email.trim());
    formData.append('phone', phone.trim());

    setSaving(true);
    try {
      const response = await employerApi.uploadCv(formData);
      if (response.data?.id) {
        setItems((current) => [response.data, ...current]);
      }
      setName('');
      setJobTitle('');
      setEmail('');
      setPhone('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSourceFilter('all');
      setQuery('');
      toast.success('CV saved to your library.');
      await loadCvs();
    } catch (error) {
      toast.error(error.message || 'Could not upload the CV.');
    } finally {
      setSaving(false);
    }
  };

  const scheduleUrlCleanup = (url, delay) => {
    objectUrlsRef.current.add(url);
    const timer = window.setTimeout(() => {
      URL.revokeObjectURL(url);
      objectUrlsRef.current.delete(url);
      timersRef.current.delete(timer);
    }, delay);
    timersRef.current.add(timer);
  };

  const openCv = async (item, mode) => {
    const actionKey = `${cvKey(item)}-${mode}`;
    let previewWindow = null;
    if (mode === 'preview') {
      previewWindow = window.open('about:blank', '_blank');
      if (!previewWindow) {
        toast.error('Allow pop-ups to preview this CV.');
        return;
      }
      previewWindow.opener = null;
    }

    setBusyItem(actionKey);
    try {
      const downloaded = item.source === 'application'
        ? await applicationsApi.downloadResume(item.applicationId || item.id)
        : await employerApi.downloadCv(item.id);
      if (!downloaded?.size) throw new Error('The CV file is unavailable.');

      const pdf = downloaded.type === 'application/pdf'
        ? downloaded
        : new Blob([downloaded], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdf);
      scheduleUrlCleanup(url, mode === 'preview' ? 120000 : 2000);

      if (mode === 'preview') {
        previewWindow.location.href = url;
      } else {
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = item.fileName || `${item.name || 'candidate'}-cv.pdf`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      }
    } catch (error) {
      if (previewWindow && !previewWindow.closed) previewWindow.close();
      toast.error(error.message || 'Could not open this CV.');
    } finally {
      setBusyItem('');
    }
  };

  const deleteCv = async (item) => {
    if (!window.confirm(`Remove ${item.name || 'this candidate'}'s uploaded CV from your library?`)) return;
    setDeletingItem(cvKey(item));
    try {
      await employerApi.deleteCv(item.id);
      setItems((current) => current.filter((entry) => cvKey(entry) !== cvKey(item)));
      toast.success('Uploaded CV removed.');
    } catch (error) {
      toast.error(error.message || 'Could not remove this CV.');
    } finally {
      setDeletingItem('');
    }
  };

  return (
    <div className="employer-cvs-page">
      <Seo title="CV Library | HEXORA" description="Review CVs submitted to your jobs and manage CVs uploaded by your team." />
      <DashboardHeader
        title="CV Library"
        description="Review CVs from candidates who applied to your jobs, and save CVs collected by your team."
        actions={<Button type="button" variant="secondary" onClick={loadCvs} disabled={loading}><RefreshCw size={16} /> Refresh</Button>}
      />

      <div className="employer-cvs-stats" aria-label="CV library summary">
        <div className="employer-cvs-stat"><span>All CVs</span><strong>{items.length}</strong></div>
        <div className="employer-cvs-stat"><span>From job applications</span><strong>{applicationCount}</strong></div>
        <div className="employer-cvs-stat"><span>Uploaded by your team</span><strong>{uploadedCount}</strong></div>
      </div>

      <div className="employer-cvs-grid">
        <section className="employer-cvs-library" aria-labelledby="employer-cvs-list-title">
          <div className="employer-cvs-section-head">
            <div>
              <p className="section-eyebrow">Candidate files</p>
              <h2 id="employer-cvs-list-title">Your CVs</h2>
              <p>Application CVs belong to candidates who applied to your jobs.</p>
            </div>
            <span className="employer-cvs-result-count">{visibleItems.length} shown</span>
          </div>

          <div className="employer-cvs-controls">
            <label className="employer-cvs-search">
              <Search size={18} aria-hidden="true" />
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, job or file" aria-label="Search CVs" />
              {query ? <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X size={15} /></button> : null}
            </label>
            <div className="employer-cvs-filters" role="group" aria-label="Filter CV source">
              <button type="button" className={sourceFilter === 'all' ? 'active' : ''} aria-pressed={sourceFilter === 'all'} onClick={() => setSourceFilter('all')}>All</button>
              <button type="button" className={sourceFilter === 'application' ? 'active' : ''} aria-pressed={sourceFilter === 'application'} onClick={() => setSourceFilter('application')}>Applications</button>
              <button type="button" className={sourceFilter === 'uploaded' ? 'active' : ''} aria-pressed={sourceFilter === 'uploaded'} onClick={() => setSourceFilter('uploaded')}>Uploaded</button>
            </div>
          </div>

          {loadError ? (
            <div className="employer-cvs-error" role="alert">
              <span>{loadError}</span>
              <Button type="button" variant="secondary" onClick={loadCvs}>Try again</Button>
            </div>
          ) : null}

          {loading ? (
            <div className="employer-cvs-state" role="status"><RefreshCw className="employer-cvs-spin" size={27} /><h3>Loading CVs...</h3></div>
          ) : loadError && !items.length ? null : visibleItems.length ? (
            <div className="employer-cvs-list">
              {visibleItems.map((item) => {
                const isApplication = item.source === 'application';
                const rowKey = cvKey(item);
                return (
                  <article className="employer-cvs-item" key={rowKey}>
                    <div className="employer-cvs-item-top">
                      <span className="employer-cvs-avatar" aria-hidden="true">{getInitials(item.name)}</span>
                      <div className="employer-cvs-person">
                        <h3>{item.name || 'Candidate'}</h3>
                        <span className={`employer-cvs-source ${isApplication ? 'is-application' : 'is-uploaded'}`}>
                          {isApplication ? 'Job application' : 'Team upload'}
                        </span>
                      </div>
                      {item.uploadedAt ? <time dateTime={item.uploadedAt}>{formatDate(item.uploadedAt)}</time> : null}
                    </div>

                    <div className="employer-cvs-details">
                      {item.email ? <span><Mail size={15} aria-hidden="true" /> {item.email}</span> : null}
                      {item.phone ? <span><Phone size={15} aria-hidden="true" /> {item.phone}</span> : null}
                      {item.jobTitle ? <span><BriefcaseBusiness size={15} aria-hidden="true" /> Applied for: {item.jobTitle}</span> : null}
                    </div>

                    <div className="employer-cvs-file-row">
                      <div className="employer-cvs-file-name"><FileText size={19} aria-hidden="true" /><span title={item.fileName || 'CV.pdf'}>{item.fileName || 'CV.pdf'}</span><small>{formatSize(item.size)}</small></div>
                      <div className="employer-cvs-actions">
                        <Button type="button" variant="secondary" size="sm" onClick={() => openCv(item, 'preview')} disabled={Boolean(busyItem) || Boolean(deletingItem)} aria-label={`Preview ${item.name || 'candidate'} CV`}><Eye size={15} /> Preview</Button>
                        <Button type="button" variant="secondary" size="sm" onClick={() => openCv(item, 'download')} disabled={Boolean(busyItem) || Boolean(deletingItem)} aria-label={`Download ${item.name || 'candidate'} CV`}><Download size={15} /> Download</Button>
                        {!isApplication ? <Button type="button" variant="ghost" size="sm" className="employer-cvs-delete" onClick={() => deleteCv(item)} disabled={Boolean(busyItem) || Boolean(deletingItem)} aria-label={`Remove ${item.name || 'candidate'} CV`}><Trash2 size={15} /> {deletingItem === rowKey ? 'Removing...' : 'Remove'}</Button> : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="employer-cvs-state">
              <Inbox size={30} aria-hidden="true" />
              <h3>{items.length ? 'No CVs match your search' : 'Your CV library is empty'}</h3>
              <p>{items.length ? 'Try another name, job or source filter.' : 'CVs from applicants to your jobs will appear here. You can also upload a PDF CV.'}</p>
              {items.length ? <Button type="button" variant="secondary" onClick={() => { setQuery(''); setSourceFilter('all'); }}>Clear filters</Button> : null}
            </div>
          )}
        </section>

        <aside className="employer-cvs-upload" aria-labelledby="employer-cvs-upload-title">
          <div className="employer-cvs-upload-head"><span className="employer-cvs-upload-icon"><UploadCloud size={21} /></span><div><p className="section-eyebrow">Add a file</p><h2 id="employer-cvs-upload-title">Upload a CV</h2></div></div>
          <p className="employer-cvs-upload-intro">Save a PDF CV you received outside the portal to your employer library.</p>
          <form onSubmit={uploadCv}>
            <label className="employer-cvs-field"><span>Candidate name <b aria-hidden="true">*</b></span><input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" required maxLength={120} /></label>
            <label className="employer-cvs-field"><span>Job applied for (optional)</span><input type="text" value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} placeholder="e.g. Sales Executive" maxLength={160} /></label>
            <label className="employer-cvs-field"><span>Email address</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="candidate@example.com" maxLength={254} /></label>
            <label className="employer-cvs-field"><span>Phone number</span><input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Optional" maxLength={40} /></label>
            <div className={`employer-cvs-dropzone ${dragOver ? 'is-dragover' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragOver(true); }} onDragLeave={(event) => { event.preventDefault(); setDragOver(false); }} onDrop={(event) => { event.preventDefault(); setDragOver(false); pickFile(event.dataTransfer?.files?.[0]); }}>
              <UploadCloud size={27} aria-hidden="true" />
              <strong>{file ? file.name : 'Drop a PDF CV here'}</strong>
              <span>{file ? formatSize(file.size) : 'PDF only, up to 10 MB'}</span>
              <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" aria-label="Choose a PDF CV" onChange={(event) => pickFile(event.target.files?.[0])} />
              <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>{file ? 'Change file' : 'Choose PDF'}</Button>
            </div>
            <Button type="submit" className="employer-cvs-submit" disabled={saving || !file}>{saving ? 'Saving CV...' : 'Save CV to library'}</Button>
          </form>
          <p className="employer-cvs-upload-note">Only your employer account can access uploaded CVs.</p>
        </aside>
      </div>
    </div>
  );
}
