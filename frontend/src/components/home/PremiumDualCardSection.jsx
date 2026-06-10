import {
  ArrowRight,
  Briefcase,
  Clock,
  FileCheck2,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UploadCloud,
  UserCheck,
  Users
} from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import Button from '../ui/Button';
import candidateCardImage from '../../assets/home/cv-img-removebg.png';
import employerCardImage from '../../assets/home/employee-requirement-removebg.png';
import './PremiumDualCardSection.css';

const miniChartData = [
  { month: 'Jan', placements: 45 },
  { month: 'Feb', placements: 52 },
  { month: 'Mar', placements: 49 },
  { month: 'Apr', placements: 63 },
  { month: 'May', placements: 58 },
  { month: 'Jun', placements: 74 }
];

const candidateHighlights = [
  { id: 'upload', icon: UploadCloud, label: <><strong>Easy & Fast</strong> Upload</> },
  { id: 'secure', icon: ShieldCheck, label: <><strong>100% Secure</strong> Your Data</> },
  { id: 'matches', icon: Sparkles, label: <><strong>Better Job</strong> Matches</> }
];

const candidateStats = [
  { icon: UploadCloud, value: '25K+', label: 'Candidates Hired' },
  { icon: Users, value: '10K+', label: 'Active Jobs' },
  { icon: TrendingUp, value: '94%', label: 'Placement Success' }
];

const employerSteps = [
  { icon: SearchCheck, label: 'Post Your Requirement', tone: 'blue' },
  { icon: Users, label: 'Get Qualified Candidates', tone: 'green' },
  { icon: Clock, label: 'Faster Hiring Process', tone: 'orange' }
];

const stepIconTone = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  orange: 'bg-orange-50 text-orange-500'
};

function EyebrowBadge({ icon: Icon, children }) {
  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200/70 bg-white/80 px-3 py-1.5 text-[0.65rem] font-extrabold uppercase tracking-wide text-emerald-700 shadow-sm sm:gap-2.5 sm:px-4 sm:py-2 sm:text-[0.72rem]">
      <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-lime-400 to-emerald-600 text-white sm:size-7">
        <Icon className="size-3 sm:size-[0.95rem]" />
      </span>
      {children}
    </span>
  );
}

function ActionCard({ id, badge, heading, description, highlights, stats, cta, securityNote, image, imageAlt, visual }) {
  const isCandidate = id === 'cv-upload';

  return (
    <article
      id={id}
      className="group relative flex h-full min-h-0 flex-col overflow-hidden rounded-[1.5rem] border border-emerald-200/50 bg-gradient-to-br from-white via-white to-emerald-50/60 shadow-[0_22px_60px_rgba(15,81,58,0.09)] transition hover:-translate-y-1 hover:border-emerald-300/70 hover:shadow-[0_30px_78px_rgba(15,81,58,0.13)] sm:rounded-[1.75rem] xl:rounded-[2rem]"
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(210px,34%)] xl:grid-cols-[minmax(0,1fr)_minmax(230px,36%)]">
        <div className="flex min-w-0 flex-col gap-3.5 p-4 sm:gap-4 sm:p-6 lg:p-7 xl:p-9">
          <EyebrowBadge icon={badge.icon}>{badge.label}</EyebrowBadge>

          <h2 className="max-w-[12ch] text-[clamp(1.85rem,5vw,3.2rem)] font-black leading-[1.02] tracking-tight text-slate-900 xl:text-[clamp(2.35rem,3vw,3.6rem)]">
            {heading}
          </h2>

          <p className="max-w-prose text-[0.92rem] leading-relaxed text-slate-600 sm:text-base lg:text-[1rem]">
            {description}
          </p>

          {highlights}
          {stats}

          <div className="mt-auto flex flex-col gap-3 pt-1">
            {cta}
            <p className="flex items-center justify-center gap-2 text-center text-xs font-semibold text-slate-500 sm:text-sm">
              <ShieldCheck className="size-4 shrink-0 text-emerald-500" />
              {securityNote}
            </p>
          </div>
        </div>

        <div className="relative min-h-[230px] overflow-hidden sm:min-h-[280px] lg:min-h-[26rem]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-[20%] bottom-[2%] aspect-square w-[112%] rounded-[46%_46%_0_46%] bg-gradient-to-br from-emerald-200/90 to-teal-300/35"
          />
          <img
            src={image}
            alt={imageAlt}
className={`absolute bottom-55 right-2 z-[24] scale-140 w-[120%] h-auto object-contain object-right-bottom drop-shadow-[0_8px_22px_rgba(15,81,58,0.16)]`}      
          />
          {visual}
        </div>
      </div>
    </article>
  );
}

export default function PremiumDualCardSection({ onCvClick, onEmployerClick }) {
  return (
    <section className="bg-[linear-gradient(180deg,#f7fffb_0%,#eef8f4_100%)] py-8 sm:py-10 lg:py-14">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 2xl:max-w-[90rem]">
        <div className="grid grid-cols-1 items-stretch gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">
          <ActionCard
            id="cv-upload"
            badge={{ icon: UserCheck, label: 'Candidate Registration' }}
            heading={
              <>
                Upload Your{' '}
                <span className="bg-gradient-to-br from-emerald-600 via-lime-500 to-emerald-800 bg-clip-text text-transparent">
                  CV
                </span>
              </>
            }
            description="Share your profile with HEXORA TALENT and our recruitment team will review suitable openings for you."
            
           stats={
  <div className="w-full max-w-[560px] overflow-hidden rounded-2xl border border-emerald-100 bg-white/95 shadow-lg backdrop-blur-sm">
    <div className="grid grid-cols-3">
      {candidateStats.map(({ icon: Icon, value, label }, index) => (
        <div
          key={label}
          className={`flex flex-col items-center justify-center px-3 py-4 text-center ${
            index > 0 ? "border-l border-emerald-100" : ""
          }`}
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Icon className="h-5 w-5" />
          </div>

          <h3 className="text-xl font-black text-slate-900 sm:text-2xl">
            {value}
          </h3>

          <p className="mt-1 text-xs font-medium leading-tight text-slate-600 sm:text-sm">
            {label}
          </p>
        </div>
      ))}
    </div>
  </div>
}
            cta={
              <Button onClick={onCvClick} size="lg" className="!grid !h-auto min-h-[3.25rem] w-full !grid-cols-[1fr_auto] items-center gap-2.5 !rounded-full !border-0 !bg-gradient-to-br !from-emerald-700 !via-emerald-500 !to-teal-800 !px-4 !py-2.5 !text-sm !font-black !text-white !shadow-[0_18px_34px_rgba(5,150,105,0.25)] hover:!-translate-y-0.5 sm:min-h-[3.75rem] sm:!px-6 sm:!text-base">
                <span className="inline-flex min-w-0 items-center justify-center gap-2 sm:gap-3">
                  <UploadCloud className="size-[18px] shrink-0 sm:size-5" />
                  <span className="truncate">Upload Your CV</span>
                </span>
                <ArrowRight className="size-9 shrink-0 rounded-full bg-white p-2 text-emerald-700 sm:size-10" />
              </Button>
            }
            securityNote="Your information is safe and secure"
            image={candidateCardImage}
            imageAlt="Candidate holding a CV"
            visual={
              <div
                aria-hidden="true"
                className="absolute left-[6%] top-[9%] z-[2] hidden size-15 items-center justify-center rounded-full bg-gradient-to-br from-lime-400 to-emerald-600 text-white shadow-lg lg:flex xl:left-[8%]"
              >
                <UploadCloud className="size-5" />
              </div>
            }
          />

          <ActionCard
            id="employer-requirements"
            badge={{ icon: Briefcase, label: 'Employer Hiring Request' }}
            heading={
              <>
                Employer{' '}
                <span className="bg-gradient-to-br from-emerald-600 via-lime-500 to-emerald-800 bg-clip-text text-transparent">
                  Requirement
                </span>{' '}
                Form
              </>
            }
            description="Tell us what role you need to fill and HEXORA TALENT will help build a qualified shortlist."
            highlights={
              <div className="flex flex-col gap-2.5 sm:gap-3">
                {employerSteps.map(({ icon: Icon, label, tone }) => (
                  <div key={label} className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-2.5">
                    <span className={`inline-flex size-10 items-center justify-center rounded-full ${stepIconTone[tone]}`}>
                      <Icon className="size-4" />
                    </span>
                    <span className="text-[0.94rem] font-black text-slate-900 sm:text-[1rem]">{label}</span>
                  </div>
                ))}
              </div>
            }
            stats={null}
            cta={
              <Button onClick={onEmployerClick} size="lg" className="!grid !h-auto min-h-[3.25rem] w-full !grid-cols-[1fr_auto] items-center gap-2.5 !rounded-full !border-0 !bg-gradient-to-br !from-emerald-700 !via-emerald-500 !to-teal-800 !px-4 !py-2.5 !text-sm !font-black !text-white !shadow-[0_18px_34px_rgba(5,150,105,0.25)] hover:!-translate-y-0.5 sm:min-h-[3.75rem] sm:!px-6 sm:!text-base">
                <span className="inline-flex min-w-0 items-center justify-center gap-2 sm:gap-3">
                  <FileCheck2 className="size-[18px] shrink-0 sm:size-5" />
                  <span className="truncate">Employer Requirement Form</span>
                </span>
                <ArrowRight className="size-9 shrink-0 rounded-full bg-white p-2 text-emerald-700 sm:size-10" />
              </Button>
            }
            securityNote="Secure - Private - Trusted by 1000+ Companies"
            image={employerCardImage}
            imageAlt="Employer reviewing hiring requirements"
            
          />
        </div>
      </div>
    </section>
  );
}
