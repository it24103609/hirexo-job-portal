import { useEffect, useRef, useState } from 'react';
import { CircleUserRound, FileText, BriefcaseBusiness, Save, RotateCcw, UploadCloud, Camera, Trash2, Eye } from 'lucide-react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { candidateApi } from '../../services/candidate.api';
import { toast } from 'react-toastify';
import Loader from '../../components/ui/Loader';
import { useCandidateProfilePicture } from '../../hooks/useCandidateProfilePicture';

function buildCompletion(form) {
  const checks = [
    Boolean(form.headline?.trim()),
    Boolean(form.summary?.trim()),
    Boolean(form.phone?.trim()),
    Boolean(form.location?.trim()),
    Boolean(form.skills?.trim()),
    Boolean(form.experienceYears)
  ];
  return Math.max(20, Math.round((checks.filter(Boolean).length / checks.length) * 100));
}

export default function CandidateProfilePage() {
  const [form, setForm] = useState({ headline: '', summary: '', phone: '', location: '', skills: '', experienceYears: '' });
  const [initialForm, setInitialForm] = useState({ headline: '', summary: '', phone: '', location: '', skills: '', experienceYears: '' });
  const [loading, setLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState(null);
  const [pictureFile, setPictureFile] = useState(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const profileImageUrl = useCandidateProfilePicture(profilePicture);

  useEffect(() => {
    Promise.all([
      candidateApi.profile(),
      candidateApi.getProfilePicture()
    ]).then(([profileRes, pictureRes]) => {
      const profile = profileRes.data || {};
      const nextForm = {
        headline: profile.headline || '',
        summary: profile.summary || '',
        phone: profile.phone || '',
        location: profile.location || '',
        skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : '',
        experienceYears: profile.experienceYears || ''
      };
      setForm(nextForm);
      setInitialForm(nextForm);
      setProfilePicture(pictureRes.data || null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading profile..." />;

  const broadcastProfileRefresh = () => {
    window.dispatchEvent(new CustomEvent('candidate-profile-updated'));
  };

  const uploadProfilePicture = async (file = pictureFile) => {
    if (!file) {
      toast.error('Select an image first');
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', file);
    setIsUploadingPicture(true);
    try {
      const response = await candidateApi.uploadProfilePicture(formData);
      setProfilePicture(response.data);
      setPictureFile(null);
      broadcastProfileRefresh();
      toast.success('Profile picture uploaded');
    } catch (err) {
      toast.error('Failed to upload profile picture');
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const handleFilePick = (picked) => {
    if (!picked) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(picked.type)) {
      toast.error('Please select an image file (JPG, PNG, WebP)');
      return;
    }
    setPictureFile(picked);
  };

  const openProfilePicture = async (mode = 'download') => {
    try {
      const blob = await candidateApi.downloadProfilePicture();
      const url = URL.createObjectURL(blob);

      if (mode === 'preview') {
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }

      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = profilePicture?.fileName || 'profile-picture.jpg';
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      toast.error('Failed to download profile picture');
    }
  };

  const completion = buildCompletion(form);
  const skillChips = form.skills
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <>
      <Seo title="Candidate Profile | Hirexo" description="Create and update your candidate profile." />
      <DashboardHeader title="My Profile" description="Keep your profile complete to improve shortlisting chances." />

      <Card className="candidate-profile-picture-card">
        <div className="candidate-picture-card-grid">
          <div className="candidate-picture-hero">
            <div className="panel-head">
              <h3><Camera size={18} /> Profile picture</h3>
              {profilePicture ? <Badge tone="success">Uploaded</Badge> : <Badge tone="neutral">Missing</Badge>}
            </div>

            <p className="candidate-picture-copy">
              A clean photo makes your profile feel complete and now shows up inside your dashboard too.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="candidate-hidden-file-input"
              onChange={(e) => handleFilePick(e.target.files?.[0] || null)}
            />

            {profilePicture ? (
              <div className="candidate-profile-picture-display">
                <div className="candidate-picture-preview">
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt="Profile" className="profile-img" />
                  ) : (
                    <div className="candidate-picture-fallback" aria-hidden="true">
                      <Camera size={28} />
                    </div>
                  )}
                </div>
                <div>
                  <div className="candidate-picture-actions">
                    <Button variant="secondary" onClick={() => openProfilePicture('preview')}><Eye size={15} /> View</Button>
                    <Button variant="secondary" onClick={() => fileInputRef.current?.click()}><UploadCloud size={15} /> Replace</Button>
                    <Button
                      variant="ghost"
                      onClick={async () => {
                        try {
                          await candidateApi.deleteProfilePicture();
                          setProfilePicture(null);
                          setPictureFile(null);
                          broadcastProfileRefresh();
                          toast.info('Profile picture removed');
                        } catch (err) {
                          toast.error('Failed to delete profile picture');
                        }
                      }}
                    >
                      <Trash2 size={15} /> Remove
                    </Button>
                  </div>
                  {pictureFile ? (
                    <div className="candidate-picture-pending">
                      <p>Ready to upload: {pictureFile.name}</p>
                      <Button type="button" onClick={() => uploadProfilePicture(pictureFile)} disabled={isUploadingPicture}>
                        <UploadCloud size={16} /> {isUploadingPicture ? 'Uploading...' : 'Upload new picture'}
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                await uploadProfilePicture();
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
                  <h3>Drag and drop your profile picture</h3>
                  <p>Upload a JPG, PNG, or WebP image. Square photos look best in dashboard cards.</p>
                  <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    <UploadCloud size={16} /> Choose image
                  </Button>
                  {pictureFile ? <p className="candidate-upload-selected">Selected: {pictureFile.name}</p> : null}
                </div>

                <div className="candidate-upload-actions">
                  <Button type="submit" disabled={!pictureFile || isUploadingPicture}>{isUploadingPicture ? 'Uploading...' : 'Upload picture'}</Button>
                </div>
              </form>
            )}
          </div>

          <div className="candidate-picture-benefits">
            <div className="candidate-picture-benefit">
              <strong>Dashboard ready</strong>
              <p>The uploaded picture now appears in your candidate dashboard and sidebar profile card.</p>
            </div>
            <div className="candidate-picture-benefit">
              <strong>Best photo style</strong>
              <p>Use a bright, centered image with a clear face crop for a more polished profile look.</p>
            </div>
            <div className="candidate-picture-benefit">
              <strong>Responsive fit</strong>
              <p>The preview is styled to stay neat on both desktop and mobile screens.</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="candidate-profile-summary-card">
        <div className="panel-head">
          <h3><CircleUserRound size={18} /> Profile summary</h3>
          <strong className="candidate-completion-label">{completion}% complete</strong>
        </div>
        <div className="candidate-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completion}>
          <span style={{ width: `${completion}%` }} />
        </div>
        <div className="candidate-summary-points">
          <p><strong>Headline:</strong> {form.headline ? 'Added' : 'Missing'}</p>
          <p><strong>Summary:</strong> {form.summary ? 'Added' : 'Missing'}</p>
          <p><strong>Skills:</strong> {skillChips.length ? `${skillChips.length} listed` : 'Missing'}</p>
          <p><strong>Experience:</strong> {form.experienceYears || 0} years</p>
        </div>
      </Card>

      <Card className="candidate-profile-form-card mt-1">
        <form className="form-grid" onSubmit={async (e) => {
          e.preventDefault();
          await candidateApi.saveProfile({
            ...form,
            experienceYears: Number(form.experienceYears || 0),
            skills: form.skills.split(',').map((item) => item.trim()).filter(Boolean)
          });
          setInitialForm(form);
          broadcastProfileRefresh();
          toast.success('Profile saved');
        }}>
          <section className="candidate-form-section">
            <div className="candidate-form-title">
              <h3><CircleUserRound size={16} /> Basic information</h3>
              <p>Add your core details so recruiters can understand your background quickly.</p>
            </div>
            <div className="grid-2">
              <Input label="Phone" value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} placeholder="+94 77 000 0000" />
              <Input label="Location" value={form.location} onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))} placeholder="Colombo / Remote" />
            </div>
            <Input label="Headline" value={form.headline} onChange={(e) => setForm((current) => ({ ...current, headline: e.target.value }))} placeholder="Senior Frontend Developer | React Specialist" />
          </section>

          <section className="candidate-form-section">
            <div className="candidate-form-title">
              <h3><FileText size={16} /> Professional summary</h3>
              <p>Share your strengths, impact, and the type of roles you are targeting.</p>
            </div>
            <Textarea label="Summary" value={form.summary} onChange={(e) => setForm((current) => ({ ...current, summary: e.target.value }))} placeholder="I build scalable, high-performing interfaces and collaborate closely with product teams..." />
          </section>

          <section className="candidate-form-section">
            <div className="candidate-form-title">
              <h3><BriefcaseBusiness size={16} /> Skills and experience</h3>
              <p>Use comma-separated skills and add your total professional experience.</p>
            </div>
            <Input label="Skills" value={form.skills} onChange={(e) => setForm((current) => ({ ...current, skills: e.target.value }))} placeholder="Node.js, MongoDB, React" />
            {skillChips.length ? (
              <div className="candidate-skill-chip-row">
                {skillChips.map((skill) => <span key={skill} className="candidate-skill-chip">{skill}</span>)}
              </div>
            ) : null}
            <Input label="Experience years" type="number" value={form.experienceYears} onChange={(e) => setForm((current) => ({ ...current, experienceYears: e.target.value }))} min="0" />
          </section>

          <div className="candidate-form-actions-bar">
            <Button type="button" variant="ghost" onClick={() => setForm(initialForm)}>
              <RotateCcw size={16} /> Reset changes
            </Button>
            <Button type="submit">
              <Save size={16} /> Save profile
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
