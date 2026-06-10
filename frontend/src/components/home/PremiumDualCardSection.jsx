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
    <span className="inline-flex w-fit items-center gap-2.5 rounded-full border border-emerald-200/70 bg-white/80 px-4 py-2 text-[0.7rem] font-extrabold uppercase tracking-wide text-emerald-700 shadow-sm sm:gap-3 sm:px-5 sm:py-2.5 sm:text-xs">
      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-lime-400 to-emerald-600 text-white sm:size-8">
        <Icon className="size-3.5 sm:size-4" />
      </span>
      {children}
    </span>
  );
}

function ActionCard({ id, badge, heading, description, highlights, stats, cta, securityNote, image, imageAlt, visual }) {
  return (
    <article
      id={id}
      className="group relative flex h-full min-h-0 flex-col overflow-hidden rounded-[1.75rem] border border-emerald-200/50 bg-gradient-to-br from-white via-white to-emerald-50/60 shadow-[0_22px_60px_rgba(15,81,58,0.09)] transition hover:-translate-y-1 hover:border-emerald-300/70 hover:shadow-[0_30px_78px_rgba(15,81,58,0.13)] sm:rounded-[2rem]"
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(220px,36%)] xl:grid-cols-[minmax(0,1fr)_minmax(240px,38%)]">
        <div className="flex min-w-0 flex-col gap-4 p-5 sm:gap-5 sm:p-7 lg:p-8 xl:p-10">
          <EyebrowBadge icon={badge.icon}>{badge.label}</EyebrowBadge>

          <h2 className="max-w-[12ch] text-[clamp(2rem,5.5vw,3.5rem)] font-black leading-[1.02] tracking-tight text-slate-900 xl:text-[clamp(2.5rem,3.2vw,3.75rem)]">
            {heading}
          </h2>

          <p className="max-w-prose text-sm leading-relaxed text-slate-600 sm:text-base lg:text-[1.05rem]">
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

        <div className="relative min-h-[260px] overflow-hidden sm:min-h-[300px] lg:min-h-[28rem]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-[18%] bottom-[4%] aspect-square w-[115%] rounded-[46%_46%_0_46%] bg-gradient-to-br from-emerald-200/90 to-teal-300/35"
          />
          <img
            src={image}
            alt={imageAlt}
            className="absolute bottom-0 right-0 z-[1] max-h-[92%] w-auto max-w-[92%] object-contain object-bottom-right drop-shadow-[0_18px_22px_rgba(15,81,58,0.16)] sm:max-h-[94%] sm:max-w-[88%] lg:max-h-[90%] lg:max-w-[96%]"
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
            highlights={
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-1.5">
                {candidateHighlights.map(({ id, icon: Icon, label }) => (
                  <div
                    key={id}
                    className="grid min-h-[4.25rem] grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-2 rounded-xl border border-emerald-100 bg-white/90 px-2.5 py-2 text-xs font-semibold text-slate-800 shadow-sm sm:min-h-[4.5rem] sm:px-3 sm:text-[0.8rem]"
                  >
                    <span className="inline-flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <Icon className="size-4" />
                    </span>
                    <span className="leading-tight [&_strong]:block [&_strong]:font-black [&_strong]:text-slate-900">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            }
            stats={
              <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-2xl border border-emerald-100 bg-white/85 shadow-md sm:grid-cols-3">
                {candidateStats.map(({ icon: Icon, value, label }, index) => (
                  <div
                    key={label}
                    className={`grid grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-2.5 px-3 py-3 sm:px-4 ${
                      index > 0 ? 'border-t border-emerald-100 sm:border-t-0 sm:border-l sm:border-emerald-100' : ''
                    }`}
                  >
                    <span className="row-span-2 inline-flex size-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <Icon className="size-5" />
                    </span>
                    <strong className="text-xl font-black leading-none text-slate-900 sm:text-2xl">{value}</strong>
                    <span className="text-xs font-semibold leading-tight text-slate-600 sm:text-sm">{label}</span>
                  </div>
                ))}
              </div>
            }
            cta={
              <Button onClick={onCvClick} size="lg" className="!grid !h-auto min-h-[3.5rem] w-full !grid-cols-[1fr_auto] items-center gap-3 !rounded-full !border-0 !bg-gradient-to-br !from-emerald-700 !via-emerald-500 !to-teal-800 !px-5 !py-3 !text-base !font-black !text-white !shadow-[0_18px_34px_rgba(5,150,105,0.25)] hover:!-translate-y-0.5 sm:min-h-[4rem] sm:!px-7 sm:!text-lg">
                <span className="inline-flex min-w-0 items-center justify-center gap-2 sm:gap-3">
                  <UploadCloud className="size-5 shrink-0 sm:size-6" />
                  <span className="truncate">Upload Your CV</span>
                </span>
                <ArrowRight className="size-10 shrink-0 rounded-full bg-white p-2.5 text-emerald-700 sm:size-11" />
              </Button>
            }
            securityNote="Your information is safe and secure"
            image={candidateCardImage}
            imageAlt="Candidate holding a CV"
            visual={
              <div
                aria-hidden="true"
                className="absolute left-[8%] top-[34%] z-[2] hidden size-12 items-center justify-center rounded-full bg-gradient-to-br from-lime-400 to-emerald-600 text-white shadow-lg lg:flex xl:left-[10%]"
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
              <div className="flex flex-col gap-3 sm:gap-4">
                {employerSteps.map(({ icon: Icon, label, tone }) => (
                  <div key={label} className="grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-3">
                    <span className={`inline-flex size-12 items-center justify-center rounded-full ${stepIconTone[tone]}`}>
                      <Icon className="size-5" />
                    </span>
                    <span className="text-sm font-black text-slate-900 sm:text-base">{label}</span>
                  </div>
                ))}
              </div>
            }
            stats={null}
            cta={
              <Button onClick={onEmployerClick} size="lg" className="!grid !h-auto min-h-[3.5rem] w-full !grid-cols-[1fr_auto] items-center gap-3 !rounded-full !border-0 !bg-gradient-to-br !from-emerald-700 !via-emerald-500 !to-teal-800 !px-5 !py-3 !text-base !font-black !text-white !shadow-[0_18px_34px_rgba(5,150,105,0.25)] hover:!-translate-y-0.5 sm:min-h-[4rem] sm:!px-7 sm:!text-lg">
                <span className="inline-flex min-w-0 items-center justify-center gap-2 sm:gap-3">
                  <FileCheck2 className="size-5 shrink-0 sm:size-6" />
                  <span className="truncate">Employer Requirement Form</span>
                </span>
                <ArrowRight className="size-10 shrink-0 rounded-full bg-white p-2.5 text-emerald-700 sm:size-11" />
              </Button>
            }
            securityNote="Secure - Private - Trusted by 1000+ Companies"
            image={employerCardImage}
            imageAlt="Employer reviewing hiring requirements"
            visual={
              <div className="absolute bottom-[22%] left-[6%] z-[2] hidden w-[8.5rem] rounded-2xl border border-emerald-100 bg-white/95 p-3 shadow-lg backdrop-blur-sm xl:block 2xl:left-[8%] 2xl:w-[9.5rem]">
                <strong className="mb-1 block text-xs font-black leading-tight text-slate-900">
                  Top Hiring Results
                </strong>
                <div className="h-[4.5rem] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={miniChartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                      <defs>
                        <linearGradient id="hiringRequestChart" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity={0.34} />
                          <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="placements"
                        stroke="#12a867"
                        strokeWidth={2.5}
                        fill="url(#hiringRequestChart)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            }
          />
        </div>
      </div>
    </section>
  );
}
