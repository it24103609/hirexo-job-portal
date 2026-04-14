import { useEffect, useMemo, useState } from 'react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { candidateApi } from '../../services/candidate.api';
import { toast } from 'react-toastify';

export default function CandidateResumePage() {
  const [resume, setResume] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    candidateApi.getResume().then((res) => setResume(res.data)).catch(() => setResume(null));
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

  return (
    <>
      <Seo title="Resume | Hirexo" description="Upload and manage your resume." />
      <DashboardHeader title="My Resume" description="PDF only. Keep your resume ready for applications." />
      <Card>
        <form className="form-grid" onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData();
          formData.append('resume', file);
          const response = await candidateApi.uploadResume(formData);
          setResume(response.data);
          toast.success('Resume uploaded');
        }}>
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <Button type="submit" disabled={!file}>Upload PDF</Button>
        </form>
      </Card>
      <Card className="mt-1">
        <h3>Current resume</h3>
        {resume ? (
          <div className="form-links">
            <Badge tone="success">Uploaded</Badge>
            <Button variant="secondary" onClick={() => openResume('preview')}>Preview</Button>
            <Button variant="secondary" onClick={() => openResume('download')}>Download</Button>
            <Button variant="ghost" onClick={async () => { await candidateApi.deleteResume(); setResume(null); toast.info('Resume removed'); }}>Delete</Button>
          </div>
        ) : <p>No resume uploaded yet.</p>}
      </Card>
    </>
  );
}
