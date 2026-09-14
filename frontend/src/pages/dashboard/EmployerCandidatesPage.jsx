import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  Plus,
  Save,
  Search,
  MoreVertical,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  Sparkles,
  X,
  Mail,
  Phone,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import { toast } from 'react-toastify';
import Seo from '../../components/ui/Seo';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Select from '../../components/ui/Select';
import { employerApi } from '../../services/employer.api';
import { applicationsApi } from '../../services/applications.api';
import { formatDate } from '../../utils/formatters';

const STAGE_OPTIONS = [
  { value: 'all', label: 'Stage' },
  { value: 'pending', label: 'Screening' },
  { value: 'reviewed', label: 'Qualified' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interview_scheduled', label: 'Client Interview' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' }
];

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function stageLabel(status) {
  const match = STAGE_OPTIONS.find((option) => option.value === status);
  return match?.label || String(status || 'Screening').replace(/_/g, ' ');
}

function stageTone(status) {
  if (status === 'hired' || status === 'shortlisted' || status === 'interview_scheduled') return 'success';
  if (status === 'rejected') return 'danger';
  return 'neutral';
}

function getCandidate(application) {
  const candidate = application.candidateUser && typeof application.candidateUser === 'object'
    ? application.candidateUser
    : {};

  return {
    ...candidate,
    name: candidate.name || application.candidateName || application.name || '',
    email: candidate.email || application.candidateEmail || application.email || ''
  };
}

function getScore(application) {
  if (Number.isFinite(Number(application.atsScore))) {
    return `${Math.round(Number(application.atsScore))}%`;
  }
  return '-';
}

function hasResume(application) {
  return Boolean(application?.resumeSnapshot?.fileName);
}

function AtsModal({ application, onClose, onDownload }) {
  if (!application) return null;

  const candidate = getCandidate(application);
  const candidateName = candidate.name || 'Candidate';
  const scoreValue = Math.round(Number(application.atsScore || 0));
  const atsDetails = application.atsDetails || {};
  const breakdown = atsDetails.breakdown || { fileQuality: 20, sectionStructure: 20, contactInfo: 15, keywordMatch: 20 };
  const sections = atsDetails.sectionsFound || { summary: true, experience: true, education: true, skills: true };
  const contacts = atsDetails.contactDetails || { email: candidate.email, phone: '', linkedin: '', github: '', location: '' };
  const extractedSkills = atsDetails.extractedSkills || application.jobTags || [];
  const matchedJobSkills = atsDetails.matchedJobSkills || [];

  const scoreLabel = scoreValue >= 80 ? 'High ATS Match' : scoreValue >= 60 ? 'Moderate ATS Match' : 'Optimization Needed';
  const scoreTone = scoreValue >= 80 ? '#1a8a56' : scoreValue >= 60 ? '#d97706' : '#dc2626';

  return (
    <div className="ats-modal-backdrop" onClick={onClose}>
      <div className="ats-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="ats-modal-header">
          <div className="ats-modal-title">
            <Sparkles size={22} style={{ color: '#1a8a56' }} />
            <div>
              <h2>ATS Resume Analysis</h2>
              <p>{candidateName} • Applied for {application.jobTitle || 'Position'}</p>
            </div>
          </div>
          <button type="button" className="ats-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="ats-modal-body">
          <div className="ats-summary-banner">
            <div className="ats-banner-left">
              <svg viewBox="0 0 36 36" className="ats-banner-score-ring">
                <path className="employer-score-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path
                  className="employer-score-fill"
                  stroke={scoreTone}
                  strokeDasharray={`${scoreValue}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" className="ats-banner-score-text">{scoreValue}%</text>
              </svg>
              <div className="ats-banner-meta">
                <h3>{scoreLabel}</h3>
                <p>
                  {atsDetails.isPdfParsed
                    ? `Parsed from PDF resume (${atsDetails.wordCount || 0} words extracted)`
                    : 'Evaluated based on profile & application details'}
                </p>
              </div>
            </div>
            {hasResume(application) && (
              <Button type="button" size="sm" onClick={() => onDownload(application)}>
                <Download size={14} />
                Resume PDF
              </Button>
            )}
          </div>

          <div>
            <h4 style={{ margin: '0 0 0.8rem', fontSize: '0.92rem', color: '#0f3d2e', fontWeight: 800 }}>ATS Score Breakdown</h4>
            <div className="ats-breakdown-grid">
              <div className="ats-breakdown-card">
                <div className="ats-breakdown-header">
                  <strong>File Quality & Density</strong>
                  <span>{breakdown.fileQuality || 0}/25</span>
                </div>
                <div className="ats-progress-track">
                  <div className="ats-progress-bar" style={{ width: `${((breakdown.fileQuality || 0) / 25) * 100}%` }} />
                </div>
              </div>

              <div className="ats-breakdown-card">
                <div className="ats-breakdown-header">
                  <strong>ATS Section Structure</strong>
                  <span>{breakdown.sectionStructure || 0}/25</span>
                </div>
                <div className="ats-progress-track">
                  <div className="ats-progress-bar" style={{ width: `${((breakdown.sectionStructure || 0) / 25) * 100}%` }} />
                </div>
              </div>

              <div className="ats-breakdown-card">
                <div className="ats-breakdown-header">
                  <strong>Contact Info & Identity</strong>
                  <span>{breakdown.contactInfo || 0}/20</span>
                </div>
                <div className="ats-progress-track">
                  <div className="ats-progress-bar" style={{ width: `${((breakdown.contactInfo || 0) / 20) * 100}%` }} />
                </div>
              </div>

              <div className="ats-breakdown-card">
                <div className="ats-breakdown-header">
                  <strong>Job Skill & Keyword Match</strong>
                  <span>{breakdown.keywordMatch || 0}/30</span>
                </div>
                <div className="ats-progress-track">
                  <div className="ats-progress-bar" style={{ width: `${((breakdown.keywordMatch || 0) / 30) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 0.6rem', fontSize: '0.92rem', color: '#0f3d2e', fontWeight: 800 }}>Detected Resume Sections</h4>
            <div className="ats-sections-panel">
              <div className={`ats-section-badge ${sections.summary ? 'found' : 'missing'}`}>
                {sections.summary ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                <span>Professional Summary</span>
              </div>
              <div className={`ats-section-badge ${sections.experience ? 'found' : 'missing'}`}>
                {sections.experience ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                <span>Work Experience</span>
              </div>
              <div className={`ats-section-badge ${sections.education ? 'found' : 'missing'}`}>
                {sections.education ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                <span>Education</span>
              </div>
              <div className={`ats-section-badge ${sections.skills ? 'found' : 'missing'}`}>
                {sections.skills ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                <span>Skills & Tech Stack</span>
              </div>
            </div>
          </div>

          {contacts && (contacts.email || contacts.phone || contacts.linkedin || contacts.github) && (
            <div>
              <h4 style={{ margin: '0 0 0.6rem', fontSize: '0.92rem', color: '#0f3d2e', fontWeight: 800 }}>Parsed Contact Details</h4>
              <div className="ats-contacts-panel">
                {contacts.email && (
                  <div className="ats-contact-item">
                    <Mail size={14} style={{ color: '#1a8a56' }} />
                    <span><strong>Email:</strong> {contacts.email}</span>
                  </div>
                )}
                {contacts.phone && (
                  <div className="ats-contact-item">
                    <Phone size={14} style={{ color: '#1a8a56' }} />
                    <span><strong>Phone:</strong> {contacts.phone}</span>
                  </div>
                )}
                {contacts.linkedin && (
                  <div className="ats-contact-item">
                    <ExternalLink size={14} style={{ color: '#1a8a56' }} />
                    <span><strong>LinkedIn:</strong> {contacts.linkedin}</span>
                  </div>
                )}
                {contacts.github && (
                  <div className="ats-contact-item">
                    <ExternalLink size={14} style={{ color: '#1a8a56' }} />
                    <span><strong>GitHub:</strong> {contacts.github}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {extractedSkills.length > 0 && (
            <div className="ats-skills-panel">
              <h4>Skills Extracted from Resume PDF ({extractedSkills.length})</h4>
              <div className="ats-skills-list">
                {extractedSkills.map((skill) => {
                  const isMatched = matchedJobSkills.includes(skill.toLowerCase());
                  return (
                    <span
                      key={skill}
                      className="ats-skill-chip"
                      style={isMatched ? { background: 'rgba(26, 138, 86, 0.15)', borderColor: '#1a8a56', color: '#0f3d2e' } : {}}
                    >
                      {skill} {isMatched && '✓'}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EmployerCandidatesPage() {
  const [state, setState] = useState({ loading: true, jobs: [], applications: [] });
  const [filters, setFilters] = useState({ keyword: '', tag: 'all', position: 'all', stage: 'all', date: 'all', rating: 'all' });
  const [selectedAtsApplication, setSelectedAtsApplication] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadCandidates = async () => {
      const jobsRes = await employerApi.jobs();
      const jobs = jobsRes.data || [];
      const applicantResults = await Promise.allSettled(jobs.map((job) => employerApi.applicants(job._id)));
      const applications = [];

      jobs.forEach((job, index) => {
        const result = applicantResults[index];
        const list = result?.status === 'fulfilled' ? result.value.data?.applications || [] : [];
        list.forEach((application) => {
          applications.push({
            ...application,
            jobId: job._id,
            jobTitle: job.title,
            jobTags: job.tags || [],
            jobCategory: job.category || job.industry || ''
          });
        });
      });

      if (!isMounted) return;
      setState({ loading: false, jobs, applications });
    };

    loadCandidates().catch(() => {
      if (!isMounted) return;
      setState({ loading: false, jobs: [], applications: [] });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const tags = useMemo(() => (
    [...new Set(state.applications.flatMap((application) => application.jobTags || []).filter(Boolean))].sort()
  ), [state.applications]);

  const positions = useMemo(() => (
    [...new Set(state.applications.map((application) => application.jobTitle).filter(Boolean))].sort()
  ), [state.applications]);

  const filteredApplications = useMemo(() => {
    const keyword = normalize(filters.keyword);
    const now = Date.now();

    return state.applications.filter((application) => {
      const candidate = getCandidate(application);
      const candidateName = candidate.name || candidate.email || 'Candidate';
      const haystack = [candidateName, candidate.email, application.jobTitle, application.status, application.jobCategory].map(normalize).join(' ');
      const createdAt = application.createdAt ? new Date(application.createdAt).getTime() : 0;
      const score = getScore(application);
      const numericScore = score === '-' ? 0 : Number(score.replace('%', ''));

      if (keyword && !haystack.includes(keyword)) return false;
      if (filters.tag !== 'all' && !(application.jobTags || []).includes(filters.tag)) return false;
      if (filters.position !== 'all' && application.jobTitle !== filters.position) return false;
      if (filters.stage !== 'all' && application.status !== filters.stage) return false;
      if (filters.date === '7d' && (!createdAt || now - createdAt > 7 * 24 * 60 * 60 * 1000)) return false;
      if (filters.date === '30d' && (!createdAt || now - createdAt > 30 * 24 * 60 * 60 * 1000)) return false;
      if (filters.rating === 'rated' && score === '-') return false;
      if (filters.rating === '80' && numericScore < 80) return false;
      return true;
    });
  }, [filters, state.applications]);

  const clearFilters = () => setFilters({ keyword: '', tag: 'all', position: 'all', stage: 'all', date: 'all', rating: 'all' });

  const saveSearch = () => {
    window.localStorage.setItem('HEXORA-employer-candidate-search', JSON.stringify(filters));
    toast.success('Current candidate search saved.');
  };

  const downloadResume = async (application) => {
    if (!hasResume(application)) {
      toast.info('This candidate has not attached a resume.');
      return;
    }

    try {
      const blob = await applicationsApi.downloadResume(application._id);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = application.resumeSnapshot?.fileName || `${getCandidate(application).name || 'candidate'}-resume`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.message || 'Unable to download resume.');
    }
  };

  if (state.loading) return <Loader label="Loading candidates..." />;

  return (
    <>
      <Seo title="Candidates | HEXORA" description="Search and filter all candidates across employer jobs." />

      <section className="rooster-page-head">
        <div>
          <h1>Candidates</h1>
          <span>{filteredApplications.length} candidates</span>
        </div>
        <Button type="button" className="rooster-create-button" onClick={saveSearch}>
          <Save size={17} />
          Save current search
        </Button>
      </section>

      <section className="rooster-filter-row" aria-label="Candidate filters">
        <label className="rooster-search-field">
          <Search size={18} aria-hidden="true" />
          <input
            value={filters.keyword}
            onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))}
            placeholder="Search"
            type="search"
          />
        </label>
        <Select value={filters.tag} onChange={(event) => setFilters((current) => ({ ...current, tag: event.target.value }))} className="rooster-select">
          <option value="all">Tags</option>
          {tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
        </Select>
        <Select value={filters.position} onChange={(event) => setFilters((current) => ({ ...current, position: event.target.value }))} className="rooster-select">
          <option value="all">Positions</option>
          {positions.map((position) => <option key={position} value={position}>{position}</option>)}
        </Select>
        <Select value={filters.stage} onChange={(event) => setFilters((current) => ({ ...current, stage: event.target.value }))} className="rooster-select">
          {STAGE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </Select>
        <Select value={filters.date} onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))} className="rooster-select">
          <option value="all">Applied Date</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </Select>
        <Select value={filters.rating} onChange={(event) => setFilters((current) => ({ ...current, rating: event.target.value }))} className="rooster-select">
          <option value="all">Rating</option>
          <option value="rated">Rated only</option>
          <option value="80">80% and above</option>
        </Select>
        <button type="button" className="rooster-clear-button" onClick={clearFilters}>Clear all</button>
      </section>

      <section className="rooster-table-card">
        <div className="rooster-table-tools">
          <strong>{filteredApplications.length} Total Candidates</strong>
          <Button as={Link} to="/employer/jobs" size="sm" variant="secondary">
            <Plus size={15} />
            Add candidate
          </Button>
        </div>

        {filteredApplications.length ? (
          <div className="employer-candidates-grid">
            {filteredApplications.map((application) => {
              const candidate = getCandidate(application);
              const candidateName = candidate.name || candidate.email || 'Candidate';
              const score = getScore(application);
              const scoreValue = score === '-' ? 0 : Number(score.replace('%', ''));
              const initials = candidateName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              const appliedDate = application.createdAt ? new Date(application.createdAt) : null;
              const isPdfRead = Boolean(application.atsDetails?.isPdfParsed);

              return (
                <div key={application._id} className="employer-candidate-card">
                  <div className="employer-candidate-card-header">
                    <div className="employer-candidate-identity">
                      <div className="employer-candidate-avatar">
                        {candidate.profilePicture ? (
                          <img src={candidate.profilePicture} alt={candidateName} className="employer-candidate-avatar-img" />
                        ) : (
                          <span>{initials}</span>
                        )}
                      </div>
                      <div className="employer-candidate-info">
                        <Link to={`/employer/applicants/${application._id}`} className="employer-candidate-name">
                          {candidateName}
                        </Link>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <Badge tone={stageTone(application.status)} className="employer-candidate-status">
                            {stageLabel(application.status)}
                          </Badge>
                          {isPdfRead && (
                            <span className="ats-parsed-badge" title="Resume PDF text extracted & parsed">
                              <FileText size={11} /> PDF Read
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button type="button" className="employer-candidate-menu" aria-label="More actions">
                      <MoreVertical size={18} />
                    </button>
                  </div>

                  <div className="employer-candidate-skills">
                    {application.jobTags?.length ? application.jobTags.slice(0, 5).map((tag) => (
                      <span key={tag} className="employer-skill-pill">{tag}</span>
                    )) : (
                      <span className="employer-no-skills">No skills listed</span>
                    )}
                  </div>

                  <div className="employer-candidate-job">
                    <span className="employer-job-label">Applied For</span>
                    <Link to={`/employer/jobs/${application.jobId}/applicants`} className="employer-job-title">
                      {application.jobTitle || 'Unknown Position'}
                    </Link>
                  </div>

                  <div className="employer-candidate-date">
                    <Calendar size={14} />
                    <span>{appliedDate ? formatDate(application.createdAt) : 'N/A'}</span>
                  </div>

                  <div className="employer-candidate-footer">
                    <div
                      className="employer-ats-score employer-ats-score-interactive"
                      title="Click to view full ATS Resume Analysis & Breakdown"
                      onClick={() => setSelectedAtsApplication(application)}
                    >
                      <svg viewBox="0 0 36 36" className="employer-score-ring">
                        <path
                          className="employer-score-bg"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="employer-score-fill"
                          stroke={scoreValue >= 80 ? '#1a8a56' : scoreValue >= 60 ? '#d97706' : '#dc2626'}
                          strokeDasharray={`${scoreValue}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <text x="18" y="20.35" className="employer-score-text">{scoreValue}%</text>
                      </svg>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="employer-score-label">ATS Score</span>
                        <span style={{ fontSize: '0.68rem', color: '#1a8a56', fontWeight: 700 }}>View breakdown ›</span>
                      </div>
                    </div>

                    <div className="employer-resume-action">
                      {hasResume(application) ? (
                        <button
                          type="button"
                          className="employer-resume-button"
                          onClick={() => downloadResume(application)}
                          aria-label={`Download ${candidateName} resume`}
                        >
                          <Download size={16} />
                          <span>Resume</span>
                        </button>
                      ) : (
                        <span className="employer-no-resume">No Resume</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="employer-no-candidates">
            <p>No candidates match these filters.</p>
          </div>
        )}
      </section>

      {selectedAtsApplication && (
        <AtsModal
          application={selectedAtsApplication}
          onClose={() => setSelectedAtsApplication(null)}
          onDownload={downloadResume}
        />
      )}
    </>
  );
}
