const connectDB = require('../config/db');
const { env, assertEnv } = require('../config/env');
const User = require('../models/User');
const Job = require('../models/Job');
const Blog = require('../models/Blog');
const Application = require('../models/Application');
const EmployerProfile = require('../models/EmployerProfile');
const HiringTeamMember = require('../models/HiringTeamMember');
const { createUniqueSlug } = require('./slug');
const { APPLICATION_STATUS, JOB_REVIEW_STATUS, JOB_STATUS, ROLES } = require('./constants');

async function ensureJob(employer, companyName, seed) {
  const existing = await Job.findOne({ employerUser: employer._id, title: seed.title });
  const slug = existing?.slug || await createUniqueSlug(Job, seed.title, {
    employerUser: employer._id.toString(),
    title: seed.title
  });

  return Job.findOneAndUpdate(
    { employerUser: employer._id, title: seed.title },
    {
      $set: {
        employerUser: employer._id,
        companyName,
        slug,
        title: seed.title,
        category: seed.category,
        industry: seed.industry,
        location: seed.location,
        jobType: seed.jobType,
        description: seed.description,
        responsibilities: seed.responsibilities,
        requirements: seed.requirements,
        skills: seed.skills,
        experienceLevel: seed.experienceLevel,
        salaryMin: seed.salaryMin,
        salaryMax: seed.salaryMax,
        currency: 'LKR',
        vacancies: seed.vacancies,
        remoteFriendly: seed.remoteFriendly,
        status: JOB_STATUS.ACTIVE,
        reviewStatus: JOB_REVIEW_STATUS.APPROVED,
        publishedAt: seed.publishedAt,
        expiresAt: seed.expiresAt,
        tags: seed.tags,
        hiringPriority: seed.hiringPriority,
        screeningQuestions: seed.screeningQuestions
      }
    },
    { new: true, upsert: true, runValidators: true }
  );
}

async function ensureBlog(admin, seed) {
  let blog = await Blog.findOne({ title: seed.title });

  if (!blog) {
    blog = new Blog({
      title: seed.title,
      author: admin._id
    });
  }

  blog.content = seed.content;
  blog.excerpt = seed.excerpt;
  blog.author = admin._id;
  blog.tags = seed.tags;
  blog.featured = seed.featured;
  blog.published = true;
  blog.publishedAt = seed.publishedAt;
  blog.image = seed.image;
  await blog.save();
  return blog;
}

async function ensureInterviewApplication({ job, candidate, employer, teamMember, roundName, status, daysFromNow, mode, location }) {
  const scheduledAt = new Date();
  scheduledAt.setDate(scheduledAt.getDate() + daysFromNow);
  scheduledAt.setHours(11, 30, 0, 0);

  return Application.findOneAndUpdate(
    { job: job._id, candidateUser: candidate._id },
    {
      $set: {
        job: job._id,
        candidateUser: candidate._id,
        employerUser: employer._id,
        status,
        candidateSource: 'Local Demo Seed',
        coverLetter: `I am interested in the ${job.title} role and available for interviews this week.`,
        interviewScheduledAt: scheduledAt,
        interviewMode: mode,
        interviewLocation: location,
        interviewMeetingLink: mode === 'video' ? 'https://meet.google.com/hirexo-local-demo' : '',
        interviewNotes: 'Seeded interview data for local testing.',
        interviewRounds: [
          {
            roundName,
            order: 1,
            status: 'scheduled',
            scheduledAt,
            durationMinutes: 45,
            mode,
            location,
            meetingLink: mode === 'video' ? 'https://meet.google.com/hirexo-local-demo' : '',
            notes: 'Discuss experience, expectations, and role fit.',
            panelInterviewers: teamMember
              ? [{ member: teamMember._id, name: teamMember.name, email: teamMember.email, title: teamMember.title }]
              : [],
            interviewSlots: [],
            reminderLeadHours: 24
          }
        ],
        interviewTimeline: [
          {
            action: 'interview_scheduled',
            actorRole: 'employer',
            actorUser: employer._id,
            summary: `${roundName} scheduled from local demo seed.`
          }
        ]
      }
    },
    { new: true, upsert: true, runValidators: true }
  );
}

async function seedDemoContent() {
  assertEnv();
  await connectDB(env.mongoUri);

  const [employer, admin, candidates] = await Promise.all([
    User.findOne({ email: 'david.thompson@hirexo.test', role: ROLES.EMPLOYER }),
    User.findOne({ role: ROLES.ADMIN }),
    User.find({ role: ROLES.CANDIDATE }).sort({ email: 1 }).limit(3)
  ]);

  if (!employer || !admin || candidates.length < 3) {
    throw new Error('Run npm run seed:test-users before seed:demo-content');
  }

  const employerProfile = await EmployerProfile.findOne({ user: employer._id });
  const companyName = employerProfile?.companyName || employer.name;
  const recruiter = await HiringTeamMember.findOne({ employerUser: employer._id }).sort({ createdAt: 1 });
  const now = new Date();

  const jobs = [];
  jobs.push(await ensureJob(employer, companyName, {
    title: 'Full Stack MERN Developer',
    category: 'Engineering',
    industry: 'Software',
    location: 'Colombo',
    jobType: 'Full Time',
    description: 'Build dashboards, APIs, and candidate workflows for a fast-moving GLOBAL GROUP.',
    responsibilities: ['Develop React screens', 'Create secure Express APIs', 'Tune MongoDB queries'],
    requirements: ['2+ years MERN experience', 'Good Git workflow', 'Comfortable with REST APIs'],
    skills: ['React', 'Node.js', 'MongoDB', 'Express'],
    experienceLevel: 'mid',
    salaryMin: 180000,
    salaryMax: 280000,
    vacancies: 2,
    remoteFriendly: true,
    publishedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3),
    expiresAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30),
    tags: ['mern', 'backend', 'frontend'],
    hiringPriority: 'high',
    screeningQuestions: [
      { question: 'How many years of MERN experience do you have?', type: 'number', required: true },
      { question: 'Can you work with MongoDB aggregation pipelines?', type: 'yes_no', required: true }
    ]
  }));

  jobs.push(await ensureJob(employer, companyName, {
    title: 'HR Interview Coordinator',
    category: 'Human Resources',
    industry: 'Recruitment',
    location: 'Kandy',
    jobType: 'Part Time',
    description: 'Coordinate interview slots, candidate reminders, and hiring team follow-ups.',
    responsibilities: ['Schedule interviews', 'Send candidate updates', 'Maintain hiring tracker'],
    requirements: ['Strong communication', 'Experience with calendars', 'Attention to detail'],
    skills: ['Recruitment', 'Scheduling', 'Communication'],
    experienceLevel: 'junior',
    salaryMin: 90000,
    salaryMax: 140000,
    vacancies: 1,
    remoteFriendly: false,
    publishedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
    expiresAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 21),
    tags: ['hr', 'interviews', 'coordination'],
    hiringPriority: 'medium',
    screeningQuestions: [
      { question: 'Are you comfortable coordinating multiple interviews per day?', type: 'yes_no', required: true }
    ]
  }));

  jobs.push(await ensureJob(employer, companyName, {
    title: 'UI UX Designer',
    category: 'Design',
    industry: 'Technology',
    location: 'Remote',
    jobType: 'Contract',
    description: 'Design polished employer and candidate journeys with clear information architecture.',
    responsibilities: ['Create wireframes', 'Prototype flows', 'Work with frontend engineers'],
    requirements: ['Portfolio required', 'Figma experience', 'Understanding of responsive design'],
    skills: ['Figma', 'UX Research', 'Design Systems'],
    experienceLevel: 'mid',
    salaryMin: 150000,
    salaryMax: 230000,
    vacancies: 1,
    remoteFriendly: true,
    publishedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5),
    expiresAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 25),
    tags: ['design', 'figma', 'remote'],
    hiringPriority: 'medium',
    screeningQuestions: [
      { question: 'Share a portfolio URL or short design case study.', type: 'textarea', required: true }
    ]
  }));

  await Promise.all([
    ensureInterviewApplication({
      job: jobs[0],
      candidate: candidates[0],
      employer,
      teamMember: recruiter,
      roundName: 'MERN Technical Interview',
      status: APPLICATION_STATUS.INTERVIEW_SCHEDULED,
      daysFromNow: 2,
      mode: 'video',
      location: 'Google Meet'
    }),
    ensureInterviewApplication({
      job: jobs[1],
      candidate: candidates[1],
      employer,
      teamMember: recruiter,
      roundName: 'HR Screening Call',
      status: APPLICATION_STATUS.INTERVIEW_SCHEDULED,
      daysFromNow: 4,
      mode: 'phone',
      location: 'Phone Call'
    }),
    ensureInterviewApplication({
      job: jobs[2],
      candidate: candidates[2],
      employer,
      teamMember: recruiter,
      roundName: 'Portfolio Review',
      status: APPLICATION_STATUS.SHORTLISTED,
      daysFromNow: 5,
      mode: 'video',
      location: 'Google Meet'
    })
  ]);

  await Promise.all([
    ensureBlog(admin, {
      title: 'How To Prepare For A Technical Interview',
      excerpt: 'A practical guide for candidates preparing for coding, system design, and portfolio discussions.',
      content: 'Technical interviews feel easier when candidates prepare with structure. Start by reviewing the role description and mapping each requirement to one project you can explain clearly. Practice explaining tradeoffs, not just final answers, because interviewers want to understand how you think. Keep a short story ready for debugging, collaboration, and learning a new tool under pressure. Before the call, test your microphone, internet connection, screen sharing, and portfolio links. After the interview, send a concise follow-up that thanks the panel and reinforces your interest in the role.',
      tags: ['interview', 'candidate', 'career'],
      featured: true,
      publishedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 4),
      image: { url: '/images/blog/interview-prep.jpg', alt: 'Candidate preparing for a technical interview' }
    }),
    ensureBlog(admin, {
      title: 'Writing Job Posts That Attract Better Applicants',
      excerpt: 'Clear job posts reduce noise and help qualified candidates decide faster.',
      content: 'A strong job post should make the opportunity feel specific and trustworthy. Use a direct title, realistic salary range, clear location expectations, and a short explanation of the team. Separate responsibilities from requirements so candidates can scan quickly. Avoid long wish lists that mix must-have skills with nice-to-have preferences. Add two or three screening questions only when they help evaluate role fit. When job posts are clear, employers spend less time filtering mismatched applicants and more time speaking with the right people.',
      tags: ['employer', 'jobs', 'hiring'],
      featured: true,
      publishedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2),
      image: { url: '/images/blog/job-posting.jpg', alt: 'Recruiter writing a job post' }
    }),
    ensureBlog(admin, {
      title: 'Interview Scheduling Tips For Hiring Teams',
      excerpt: 'Small scheduling habits can make the hiring process feel faster and more professional.',
      content: 'Interview scheduling is one of the easiest places to improve candidate experience. Share time slots early, include the interview format, and name the panel members when possible. Keep reminders friendly and specific so candidates know what to prepare. If a candidate requests a reschedule, respond quickly and record the reason for the hiring team. A consistent scheduling process reduces confusion, prevents missed calls, and gives employers a more reliable view of candidate engagement across the pipeline.',
      tags: ['interview', 'employer', 'process'],
      featured: false,
      publishedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
      image: { url: '/images/blog/scheduling.jpg', alt: 'Calendar with interview reminders' }
    })
  ]);

  console.log('Demo jobs, blogs, and interview applications seeded successfully');
  process.exit(0);
}

seedDemoContent().catch((error) => {
  console.error(error);
  process.exit(1);
});
