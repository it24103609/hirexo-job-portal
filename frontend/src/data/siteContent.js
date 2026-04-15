export const siteContent = {
  brandName: 'Hirexo',
  aboutIntro: 'Hirexo is a results-driven recruitment partner built for speed, precision, and impact. We go beyond CVs, focusing on real business needs, team fit, and long-term success.',
  mission: 'To connect businesses with the right talent through efficient, reliable, and people-focused recruitment solutions.',
  vision: 'To become a trusted global partner in delivering top talent with speed and precision.',
  values: 'We act with integrity, move with speed, and focus on results, building lasting relationships through trust and excellence.',
  testimonial: 'Hirexo demonstrated a clear understanding of our hiring needs and consistently delivered candidates aligned with our culture and expectations. Their professionalism, speed, and responsiveness made the recruitment process smooth and efficient.',
  contact: {
    phonePrimary: '0773191832',
    phoneSecondary: '0705343427',
    whatsapp: '94773191832',
    email: 'hello@reallygreatsite.com',
    address: '15 1/6 Umbichi Place, Wolfandal Street, Colombo 13',
    prompt: "Don't hesitate to contact us"
  },
  homeStats: [
    { label: 'Active roles', value: '250+' },
    { label: 'Hiring partners', value: '120+' },
    { label: 'Candidate matches', value: '15k+' },
    { label: 'Cities covered', value: '30+' }
  ],
  services: [
    {
      title: 'Staff Augmentation',
      description: 'Flexible hiring support to scale teams quickly with role-ready professionals.'
    },
    {
      title: 'Permanent Recruitment',
      description: 'Long-term placements focused on role fit, culture alignment, and retention.'
    },
    {
      title: 'Contract & Project Staffing',
      description: 'On-demand contract hiring for project timelines and specialized skill requirements.'
    },
    {
      title: 'IT & Non-IT Talent Acquisition',
      description: 'Targeted sourcing across technical and functional roles for diverse business teams.'
    },
    {
      title: 'Recruitment Consulting',
      description: 'Advisory support to improve hiring strategy, pipeline quality, and recruitment outcomes.'
    }
  ],
  whyChooseUs: [
    'Fast delivery with measurable hiring outcomes',
    'Role, culture, and skill alignment',
    'Practical workflows for candidates and employers',
    'Structured review and moderation for quality control'
  ],
  featuredJobs: [
    { _id: 'mock-1', slug: 'senior-software-engineer', title: 'Senior Software Engineer', companyName: 'TechCorp Solutions', location: 'Bangalore', jobType: 'Full-time', salary: '₹12L - ₹18L' },
    { _id: 'mock-2', slug: 'devops-engineer', title: 'DevOps Engineer', companyName: 'CloudPro Inc', location: 'Hyderabad', jobType: 'Full-time', salary: '₹10L - ₹16L' },
    { _id: 'mock-3', slug: 'data-scientist', title: 'Data Scientist', companyName: 'DataDriven Analytics', location: 'Pune', jobType: 'Hybrid', salary: '₹11L - ₹17L' }
  ],
  mockJobs: [
    { _id: 'mock-1', slug: 'senior-software-engineer', title: 'Senior Software Engineer', companyName: 'TechCorp Solutions', location: 'Bangalore', jobType: 'Full-time', salaryMin: 1200000, salaryMax: 1800000, reviewStatus: 'approved', status: 'active', description: 'Build scalable backend systems and strong API integrations.' },
    { _id: 'mock-2', slug: 'devops-engineer', title: 'DevOps Engineer', companyName: 'CloudPro Inc', location: 'Hyderabad', jobType: 'Full-time', salaryMin: 1000000, salaryMax: 1600000, reviewStatus: 'approved', status: 'active', description: 'Own CI/CD, cloud automation, and deployment reliability.' },
    { _id: 'mock-3', slug: 'frontend-developer', title: 'Frontend Developer', companyName: 'DesignHub', location: 'Chennai', jobType: 'Hybrid', salaryMin: 850000, salaryMax: 1400000, reviewStatus: 'approved', status: 'active', description: 'Create polished, responsive user experiences.' }
  ],
  mockBlogs: [
    { slug: 'how-to-build-a-strong-resume', title: 'How to Build a Strong Resume', excerpt: 'A practical guide to writing resumes that get shortlisted.', category: 'Career Tips', publishedAt: '2026-03-20' },
    { slug: 'hiring-trends-2026', title: 'Hiring Trends to Watch in 2026', excerpt: 'What employers are prioritizing this year and how candidates can adapt.', category: 'Blog', publishedAt: '2026-03-22' },
    { slug: 'writing-better-job-descriptions', title: 'Writing Better Job Descriptions', excerpt: 'How employers can attract the right applicants faster.', category: 'Employer Branding', publishedAt: '2026-03-24' }
  ],
  dashboardLinks: {
    candidate: [
      { label: 'Dashboard', to: '/candidate/dashboard' },
      { label: 'My Profile', to: '/candidate/profile' },
      { label: 'My Resume', to: '/candidate/resume' },
      { label: 'Applied Jobs', to: '/candidate/applications' },
      { label: 'Saved Jobs', to: '/candidate/saved-jobs' },
      { label: 'Notifications', to: '/candidate/notifications' }
    ],
    employer: [
      { label: 'Dashboard', to: '/employer/dashboard' },
      { label: 'Company Profile', to: '/employer/company-profile' },
      { label: 'Manage Jobs', to: '/employer/jobs' },
      { label: 'Post Job', to: '/employer/jobs/new' },
      { label: 'Notifications', to: '/employer/notifications' }
    ],
    admin: [
      { label: 'Dashboard', to: '/admin/dashboard' },
      { label: 'Users', to: '/admin/users' },
      { label: 'Jobs', to: '/admin/jobs' },
      { label: 'Master Data', to: '/admin/master-data' },
      { label: 'Blogs', to: '/admin/blogs' },
      { label: 'Inquiries', to: '/admin/inquiries' },
      { label: 'Reports', to: '/admin/reports' },
      { label: 'Notifications', to: '/admin/notifications' }
    ]
  }
};

export const mockBlogs = siteContent.mockBlogs;
