import { BookOpen, ClipboardList, Users, Wallet } from 'lucide-react';
import DivisionPage from './DivisionPage';

const config = {
  id: 'hr',
  seoTitle: 'HEXORA HR CONSULTING | HR & Payroll',
  seoDescription: 'Comprehensive HR consulting services to streamline operations, improve employee engagement, and ensure compliance.',
  badgeLabel: 'HEXORA HR CONSULTING',
  title: 'HEXORA',
  spanTitle: 'HR CONSULTING',
  tagline: 'HR & Payroll Solutions',
  icon: Users,
  desc: 'Helping organizations build high-performing workplaces.',
  text: 'We provide comprehensive HR consulting services designed to streamline operations, improve employee engagement, and ensure compliance.',
  heroImage: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1920&q=85',
  heroImageAlt: 'HR consulting and team collaboration',
  ctaImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1920&q=85',
  stats: [
    { value: '500+', label: 'Clients Served' },
    { value: '10K+', label: 'Payrolls Managed' },
    { value: '100%', label: 'Compliance Rate' }
  ],
  highlights: [
    {
      icon: Wallet,
      title: 'Payroll Automation',
      text: 'Accurate, timely payroll processing with full statutory compliance and reporting.'
    },
    {
      icon: BookOpen,
      title: 'Policy Framework',
      text: 'Employee handbooks, HR policies, and governance structures tailored to your organization.'
    },
    {
      icon: ClipboardList,
      title: 'Workforce Development',
      text: 'Performance management, training programs, and organizational development support.'
    }
  ],
  servicesHeading: 'Services',
  services: [
    'HR Strategy Development',
    'Payroll Management',
    'HR Outsourcing',
    'Performance Management Systems',
    'Employee Handbook Development',
    'HR Policy Formulation',
    'Recruitment Support',
    'Organizational Development',
    'Training & Development'
  ],
  benefitsHeading: 'Benefits',
  benefits: [
    'Cost Effective HR Solutions',
    'Compliance Management',
    'Improved Workforce Productivity',
    'Professional HR Guidance'
  ],
  actions: [
    { label: 'Get Started', link: '/contact' },
    { label: 'Contact Us', link: '/contact' }
  ],
  overviewPoints: [
    'HR Consulting & Payroll Solutions',
    'Organizational Development',
    'Training & Compliance'
  ],
  industries: [
    'Information Technology',
    'Banking & Financial Services',
    'Manufacturing',
    'Healthcare',
    'Retail & FMCG',
    'Logistics & Supply Chain',
    'Hospitality',
    'Telecommunications'
  ],
  clients: ['SMEs', 'Corporations', 'Financial Institutions', 'Manufacturing Firms', 'Service Providers', 'Tech Companies'],
  testimonials: [
    'Their HR consulting services streamlined our operations and improved productivity.',
    'Professional, responsive, and reliable HR partnership for our growing team.',
    'HEXORA helped us build a high-performing and engaged workplace culture.'
  ]
};

export default function HrConsultingPage() {
  return <DivisionPage config={config} />;
}
