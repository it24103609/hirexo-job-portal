const connectDB = require('../config/db');
const { env, assertEnv } = require('../config/env');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Offer = require('../models/Offer');
const HiringTeamMember = require('../models/HiringTeamMember');
const HiringApproval = require('../models/HiringApproval');
const HiringAllocation = require('../models/HiringAllocation');
const HiringPolicy = require('../models/HiringPolicy');
const HiringConfiguration = require('../models/HiringConfiguration');
const EmployerProfile = require('../models/EmployerProfile');
const Notification = require('../models/Notification');
const { createUniqueSlug } = require('./slug');
const { JOB_REVIEW_STATUS, JOB_STATUS, APPLICATION_STATUS, ROLES } = require('./constants');

async function ensureJob(employerUser, companyName, seed) {
  const existing = await Job.findOne({ employerUser: employerUser._id, title: seed.title });
  const slug = existing?.slug || await createUniqueSlug(Job, seed.title, { employerUser: employerUser._id.toString(), title: seed.title });

  return Job.findOneAndUpdate(
    { employerUser: employerUser._id, title: seed.title },
    {
      $set: {
        employerUser: employerUser._id,
        companyName,
        title: seed.title,
        slug,
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
        remoteFriendly: seed.remoteFriendly,
        status: JOB_STATUS.ACTIVE,
        reviewStatus: JOB_REVIEW_STATUS.APPROVED,
        publishedAt: seed.publishedAt,
        expiresAt: seed.expiresAt,
        hiringPriority: seed.hiringPriority,
        tags: seed.tags
      }
    },
    { new: true, upsert: true, runValidators: true }
  );
}

async function seedHiringOpsDemo() {
  assertEnv();
  await connectDB(env.mongoUri);

  const employer = await User.findOne({ email: 'david.thompson@hirexo.test', role: ROLES.EMPLOYER });
  const admin = await User.findOne({ role: ROLES.ADMIN });
  const candidates = await User.find({ role: ROLES.CANDIDATE }).sort({ email: 1 }).limit(3);

  if (!employer || !admin || candidates.length < 2) {
    throw new Error('Seed base users first with npm run seed:test-users');
  }

  const employerProfile = await EmployerProfile.findOne({ user: employer._id });
  const companyName = employerProfile?.companyName || employer.name;

  const teamSeeds = [
    { name: 'Maya Perera', email: 'maya.perera@hirexo.test', title: 'Lead Recruiter', permissions: ['jobs', 'applicants', 'analytics'] },
    { name: 'Rohan Silva', email: 'rohan.silva@hirexo.test', title: 'Technical Interviewer', permissions: ['applicants', 'offers'] },
    { name: 'Ishani Fernando', email: 'ishani.fernando@hirexo.test', title: 'Hiring Coordinator', permissions: ['jobs', 'messages'] }
  ];

  const teamMembers = [];
  for (const seed of teamSeeds) {
    const member = await HiringTeamMember.findOneAndUpdate(
      { employerUser: employer._id, email: seed.email },
      { $set: { employerUser: employer._id, ...seed, status: 'active' } },
      { new: true, upsert: true, runValidators: true }
    );
    teamMembers.push(member);
  }

  const now = new Date();
  const jobs = [];
  jobs.push(await ensureJob(employer, companyName, {
    title: 'Senior Frontend Engineer',
    category: 'Engineering',
    industry: 'Technology',
    location: 'Colombo',
    jobType: 'Full Time',
    description: 'Lead frontend delivery for core employer and candidate experiences.',
    responsibilities: ['Own frontend features', 'Collaborate with backend team'],
    requirements: ['React expertise', 'Design systems experience'],
    skills: ['React', 'JavaScript', 'UI Architecture'],
    experienceLevel: 'senior',
    salaryMin: 250000,
    salaryMax: 400000,
    remoteFriendly: true,
    publishedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 12),
    expiresAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14),
    hiringPriority: 'urgent',
    tags: ['frontend', 'priority']
  }));
  jobs.push(await ensureJob(employer, companyName, {
    title: 'People Operations Coordinator',
    category: 'Operations',
    industry: 'Technology',
    location: 'Colombo',
    jobType: 'Full Time',
    description: 'Coordinate hiring logistics, approvals, and onboarding timelines.',
    responsibilities: ['Manage interview logistics', 'Support approvals workflow'],
    requirements: ['Coordination experience', 'Communication'],
    skills: ['Operations', 'Scheduling', 'Recruitment'],
    experienceLevel: 'mid',
    salaryMin: 140000,
    salaryMax: 210000,
    remoteFriendly: false,
    publishedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
    expiresAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 20),
    hiringPriority: 'high',
    tags: ['operations', 'coordination']
  }));

  const applicationSeeds = [
    {
      job: jobs[0],
      candidate: candidates[0],
      status: APPLICATION_STATUS.INTERVIEW_SCHEDULED,
      interviewRounds: [{
        roundName: 'Technical Round',
        order: 1,
        status: 'scheduled',
        scheduledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 10, 0),
        durationMinutes: 60,
        mode: 'video',
        location: 'Google Meet',
        meetingLink: 'https://meet.google.com/demo-hirexo',
        notes: 'Portfolio review and system design',
        panelInterviewers: [{ member: teamMembers[1]._id, name: teamMembers[1].name, email: teamMembers[1].email, title: teamMembers[1].title }],
        interviewSlots: [],
        reminderLeadHours: 24
      }]
    },
    {
      job: jobs[0],
      candidate: candidates[1],
      status: APPLICATION_STATUS.SHORTLISTED,
      interviewRounds: [{
        roundName: 'Recruiter Intro',
        order: 1,
        status: 'reschedule_requested',
        scheduledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 15, 0),
        durationMinutes: 30,
        mode: 'video',
        location: 'Zoom',
        meetingLink: 'https://zoom.us/j/demo-hirexo',
        notes: 'Candidate requested a later afternoon slot',
        panelInterviewers: [{ member: teamMembers[0]._id, name: teamMembers[0].name, email: teamMembers[0].email, title: teamMembers[0].title }],
        interviewSlots: [],
        reminderLeadHours: 24,
        rescheduleRequestedAt: new Date(),
        rescheduleRequestReason: 'Current interview overlaps with notice-period handover'
      }]
    },
    {
      job: jobs[1],
      candidate: candidates[2],
      status: APPLICATION_STATUS.REVIEWED,
      interviewRounds: []
    }
  ];

  const applications = [];
  for (const seed of applicationSeeds) {
    const application = await Application.findOneAndUpdate(
      { job: seed.job._id, candidateUser: seed.candidate._id },
      {
        $set: {
          job: seed.job._id,
          candidateUser: seed.candidate._id,
          employerUser: employer._id,
          status: seed.status,
          candidateSource: 'Seed Demo',
          interviewRounds: seed.interviewRounds,
          interviewScheduledAt: seed.interviewRounds[0]?.scheduledAt,
          interviewMode: seed.interviewRounds[0]?.mode,
          interviewLocation: seed.interviewRounds[0]?.location,
          interviewMeetingLink: seed.interviewRounds[0]?.meetingLink,
          interviewNotes: seed.interviewRounds[0]?.notes
        }
      },
      { new: true, upsert: true, runValidators: true }
    );
    applications.push(application);
  }

  await Offer.findOneAndUpdate(
    { employerUser: employer._id, application: applications[0]._id },
    {
      $set: {
        employerUser: employer._id,
        application: applications[0]._id,
        candidateUser: applications[0].candidateUser,
        job: jobs[0]._id,
        title: 'Senior Frontend Engineer Offer',
        salary: 320000,
        currency: 'LKR',
        status: 'sent',
        joiningDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        notes: 'Pending internal budget sign-off before final acceptance',
        preparedByName: teamMembers[0].name,
        sentAt: new Date()
      }
    },
    { new: true, upsert: true, runValidators: true }
  );

  const approvals = [
    {
      type: 'offer_approval',
      title: 'Approve frontend offer package',
      description: 'Need finance approval for revised salary band before final negotiation.',
      priority: 'high'
    },
    {
      type: 'interview_reschedule',
      title: 'Approve recruiter intro reschedule',
      description: 'Candidate requested a different slot for recruiter screen.',
      priority: 'medium'
    },
    {
      type: 'policy_change',
      title: 'Approve 12-hour reminder policy',
      description: 'Operations wants a shorter interview reminder window for urgent roles.',
      priority: 'low',
      status: 'approved'
    }
  ];

  for (const seed of approvals) {
    await HiringApproval.findOneAndUpdate(
      { employerUser: employer._id, title: seed.title },
      {
        $set: {
          employerUser: employer._id,
          type: seed.type,
          title: seed.title,
          description: seed.description,
          priority: seed.priority,
          status: seed.status || 'pending',
          requestedByName: teamMembers[2].name,
          requesterRole: 'employer',
          dueAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
          reviewedBy: seed.status === 'approved' ? admin._id : undefined,
          reviewedAt: seed.status === 'approved' ? new Date() : undefined
        }
      },
      { new: true, upsert: true, runValidators: true }
    );
  }

  const allocationSeeds = [
    { job: jobs[0], teamMember: teamMembers[0], allocationType: 'recruiter', roundName: '', workloadPercent: 60 },
    { job: jobs[0], teamMember: teamMembers[1], allocationType: 'interviewer', roundName: 'Technical Round', workloadPercent: 35 },
    { job: jobs[1], teamMember: teamMembers[2], allocationType: 'coordinator', roundName: '', workloadPercent: 50 }
  ];

  for (const seed of allocationSeeds) {
    await HiringAllocation.findOneAndUpdate(
      {
        employerUser: employer._id,
        job: seed.job._id,
        teamMember: seed.teamMember._id,
        allocationType: seed.allocationType
      },
      {
        $set: {
          employerUser: employer._id,
          job: seed.job._id,
          teamMember: seed.teamMember._id,
          allocationType: seed.allocationType,
          roundName: seed.roundName,
          workloadPercent: seed.workloadPercent,
          status: 'active',
          notes: 'Seeded allocation for demo workflow'
        }
      },
      { new: true, upsert: true, runValidators: true }
    );
  }

  const policies = [
    {
      name: 'Fast-track Engineering SLA',
      category: 'sla',
      description: 'Urgent engineering roles must receive first review within 12 hours.',
      tags: ['engineering', 'sla'],
      rules: { responseSlaHours: 12, interviewReminderHours: 24, offerExpiryDays: 5, approvalRequired: true, autoArchiveDays: 20 }
    },
    {
      name: 'Offer Governance Standard',
      category: 'offer',
      description: 'All offers above benchmark salary require finance sign-off.',
      tags: ['offer', 'finance'],
      rules: { responseSlaHours: 24, interviewReminderHours: 24, offerExpiryDays: 7, approvalRequired: true, autoArchiveDays: 30 }
    }
  ];

  for (const seed of policies) {
    await HiringPolicy.findOneAndUpdate(
      { employerUser: employer._id, name: seed.name },
      {
        $set: {
          employerUser: employer._id,
          name: seed.name,
          category: seed.category,
          description: seed.description,
          status: 'active',
          tags: seed.tags,
          rules: seed.rules
        }
      },
      { new: true, upsert: true, runValidators: true }
    );
  }

  await HiringConfiguration.findOneAndUpdate(
    { employerUser: employer._id },
    {
      $set: {
        employerUser: employer._id,
        interviewReminderHours: 24,
        rescheduleApprovalRequired: true,
        offerApprovalRequired: true,
        exportFormat: 'csv',
        activitySyncMode: 'daily',
        defaultInterviewDurationMinutes: 45,
        defaultCalendarView: 'agenda'
      }
    },
    { new: true, upsert: true, runValidators: true }
  );

  const notifications = [
    {
      user: employer._id,
      type: 'interview',
      category: 'interviews',
      priority: 'high',
      title: 'Technical round starts soon',
      message: `${candidates[0].name} interview is scheduled within the next 48 hours.`,
      metadata: { applicationId: applications[0]._id, roundId: applications[0].interviewRounds?.[0]?._id }
    },
    {
      user: employer._id,
      type: 'approval',
      category: 'approvals',
      priority: 'high',
      title: 'Offer approval waiting',
      message: 'Frontend offer package still needs finance approval.',
      metadata: { applicationId: applications[0]._id }
    },
    {
      user: candidates[0]._id,
      type: 'offer',
      category: 'offers',
      priority: 'medium',
      title: 'Offer shared',
      message: 'A job offer is available for your frontend application.',
      metadata: { applicationId: applications[0]._id }
    },
    {
      user: candidates[1]._id,
      type: 'interview',
      category: 'interviews',
      priority: 'medium',
      title: 'Reschedule request received',
      message: 'Your recruiter intro round is waiting for employer confirmation.',
      metadata: { applicationId: applications[1]._id, roundId: applications[1].interviewRounds?.[0]?._id }
    },
    {
      user: admin._id,
      type: 'job_review',
      category: 'approvals',
      priority: 'medium',
      title: 'Moderation queue healthy',
      message: 'Hiring operations demo data has been seeded and is ready for review.',
      metadata: { jobId: jobs[0]._id }
    }
  ];

  for (const seed of notifications) {
    await Notification.findOneAndUpdate(
      { user: seed.user, title: seed.title },
      { $set: seed },
      { new: true, upsert: true, runValidators: true }
    );
  }

  console.log('Hiring ops demo data seeded successfully');
  process.exit(0);
}

seedHiringOpsDemo().catch((error) => {
  console.error(error);
  process.exit(1);
});
