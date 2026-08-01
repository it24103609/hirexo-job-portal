import { Users } from 'lucide-react';
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
  accentClass: 'division-hero-hr',
  hexoraClass: 'hexora-division-hr',
  desc: 'Helping organizations build high-performing workplaces.',
  text: 'We provide comprehensive HR consulting services designed to streamline operations, improve employee engagement, and ensure compliance.',
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