import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { UploadCloud, FileCheck2, Eye, RefreshCw, Trash2, FileUp } from 'lucide-react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { candidateApi } from '../../services/candidate.api';
import { toast } from 'react-toastify';
import Loader from '../../components/ui/Loader';

export default function CandidateResumePage() {
  const [resume, setResume] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    candidateApi.getResume()
      .then((res) => setResume(res.data))
      .catch(() => setResume(null))
      .finally(() => setLoading(false));
  }, []);

  const openResume = async (mode = 'download') => {
    const blob = await candidateApi.downloadResume();
    const url = URL.createObjectURL(blob);

    if (mode === 'preview') {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = resume?.fileName || 'resume.pdf';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleFilePick = (picked) => {
    if (!picked) return;
    if (picked.type !== 'application/pdf') {
      toast.error('Please select a PDF file only');
      return;
    }
    setFile(picked);
  };

  if (loading) return <Loader label="Loading resume..." />;

  return (
    <>
      <Seo title="Resume | Hirexo" description="Upload and manage your resume." />
      <DashboardHeader title="My Resume" description="PDF only. Keep your resume ready for applications." />

      <Card className="candidate-resume-upload-card">
        <form className="form-grid" onSubmit={async (e) => {
          e.preventDefault();
          if (!file) {
            toast.error('Select a PDF resume first');
            return;
          }

          const formData = new FormData();
          formData.append('resume', file);
          setIsUploading(true);
          try {
            const response = await candidateApi.uploadResume(formData);
            setResume(response.data);
            setFile(null);
            toast.success('Resume uploaded');
          } finally {
            setIsUploading(false);
          }
        }}>
          <div
            className={`candidate-upload-dropzone ${isDragOver ? 'is-dragover' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const dropped = e.dataTransfer?.files?.[0] || null;
              handleFilePick(dropped);
            }}
          >
            <UploadCloud size={26} />
            <h3>Drag and drop your resume</h3>
            <p>Upload a PDF (max 2MB recommended) for faster applications.</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="candidate-hidden-file-input"
              onChange={(e) => handleFilePick(e.target.files?.[0] || null)}
            />
            <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
              <FileUp size={16} /> Choose PDF
            </Button>
            {file ? <p className="candidate-upload-selected">Selected: {file.name}</p> : null}
          </div>

          <div className="candidate-upload-actions">
            <Button type="submit" disabled={!file || isUploading}>{isUploading ? 'Uploading...' : 'Upload resume'}</Button>
            <Link className="btn btn-ghost" to="/jobs">Browse jobs</Link>
          </div>
        </form>
      </Card>

      <Card className="mt-1 candidate-resume-current-card">
        <div className="panel-head">
          <h3>Current resume</h3>
          {resume ? <Badge tone="success">Uploaded</Badge> : <Badge tone="neutral">Missing</Badge>}
        </div>

        {resume ? (
          <div className="candidate-resume-file-card">
            <div className="candidate-resume-file-meta">
              <span className="candidate-stat-icon"><FileCheck2 size={18} /></span>
              <div>
                <strong>{resume.fileName || 'resume.pdf'}</strong>
                <p>Keep this updated for better shortlisting quality.</p>
              </div>
            </div>
            <div className="candidate-resume-file-actions">
              <Button variant="secondary" onClick={() => openResume('preview')}><Eye size={15} /> View</Button>
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()}><RefreshCw size={15} /> Replace</Button>
              <Button
                variant="ghost"
                onClick={async () => {
                  await candidateApi.deleteResume();
                  setResume(null);
                  toast.info('Resume removed');
                }}
              >
                <Trash2 size={15} /> Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="candidate-empty-strong">
            <UploadCloud size={26} />
            <h4>No resume uploaded yet</h4>
            <p>Upload your latest PDF resume to start applying with one click.</p>
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>Upload now</Button>
          </div>
        )}
      </Card>
    </>
  );
}
