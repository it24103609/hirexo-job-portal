import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';

export default function EmployerCandidateDetailPage() {
  return (
    <>
      <Seo title="Candidate Details | Hirexo" description="Review a candidate profile and resume." />
      <DashboardHeader title="Candidate Details" description="Detailed candidate view can be expanded from the applicants table." />
      <Card>
        <p>This route is scaffolded for a candidate deep-dive screen. It will usually be opened from an applicant row and can show profile, resume preview, notes, and status controls.</p>
      </Card>
    </>
  );
}
