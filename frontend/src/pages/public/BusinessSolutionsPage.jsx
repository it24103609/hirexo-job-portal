import { TrendingUp } from 'lucide-react';
import DivisionPage from './DivisionPage';

const config = {
  id: 'business',
  seoTitle: 'HEXORA BUSINESS SOLUTIONS | Consulting & Advisory',
  seoDescription: 'Strategic solutions for sustainable business growth. Assisting startups, SMEs, and established organizations.',
  badgeLabel: 'HEXORA BUSINESS SOLUTIONS',
  title: 'HEXORA',
  spanTitle: 'BUSINESS SOLUTIONS',
  tagline: 'Consulting & Business Advisory',
  icon: TrendingUp,
  accentClass: 'division-hero-business',
  hexoraClass: 'hexora-division-business',
  desc: 'Strategic solutions for sustainable business growth.',
  text: 'We assist startups, SMEs, and established organizations in overcoming challenges and achieving their business objectives.',
  servicesHeading: 'Services',
  services: [
    'Business Consulting',
    'Startup Advisory',
    'Process Improvement',
    'Business Strategy Development',
    'Market Research',
    'Business Planning',
    'Corporate Advisory',
    'Growth & Expansion Planning'
  ],
  benefitsHeading: 'Why Work With Us',
  benefits: [
    'Practical Business Solutions',
    'Industry Expertise',
    'Customized Strategies',
    'Long-Term Partnership Approach'
  ],
  actions: [
    { label: 'Get Advice', link: '/contact' },
    { label: 'Contact Us', link: '/contact' }
  ],
  overviewPoints: [
    'Business & Startup Advisory',
    'Strategy & Market Research',
    'Growth & Expansion Planning'
  ],
  industries: [
    'Information Technology',
    'Banking & Financial Services',
    'FinTech',
    'Healthcare',
    'Manufacturing',
    'Retail & FMCG',
    'Professional Services',
    'Construction'
  ],
  clients: ['Startups', 'SMEs', 'Corporations', 'Financial Institutions', 'Tech Companies', 'Service Providers'],
  testimonials: [
    'HEXORA provided practical strategies that accelerated our business growth.',
    'Their startup advisory helped us secure the right market positioning.',
    'A strategic partner we trust for long-term business success.'
  ]
};

export default function BusinessSolutionsPage() {
  return <DivisionPage config={config} />;
}