import { Globe2, ShieldCheck, Ship } from 'lucide-react';
import DivisionPage from './DivisionPage';

const config = {
  id: 'trade',
  seoTitle: 'HEXORA GLOBAL TRADE | Import, Export & Trading',
  seoDescription: 'Facilitating international trade partnerships and sourcing solutions to help businesses expand their reach globally.',
  badgeLabel: 'HEXORA GLOBAL TRADE',
  title: 'HEXORA',
  spanTitle: 'GLOBAL TRADE',
  tagline: 'Import, Export & Trading Solutions',
  icon: Globe2,
  desc: 'Connecting businesses to global markets.',
  text: 'HEXORA GLOBAL TRADE facilitates international trade partnerships and sourcing solutions, helping businesses expand their reach and access quality products worldwide.',
  heroImage: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1920&q=85',
  heroImageAlt: 'Global trade and logistics',
  ctaImage: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1ea?auto=format&fit=crop&w=1920&q=85',
  stats: [
    { value: '50+', label: 'Global Markets' },
    { value: '200+', label: 'Verified Suppliers' },
    { value: '99%', label: 'On-Time Delivery' }
  ],
  highlights: [
    {
      icon: Globe2,
      title: 'Global Sourcing Network',
      text: 'Access verified suppliers and buyers across continents with our established trade partnerships.'
    },
    {
      icon: ShieldCheck,
      title: 'Trade Compliance',
      text: 'Navigate customs, documentation, and regulatory requirements with expert guidance at every step.'
    },
    {
      icon: Ship,
      title: 'End-to-End Logistics',
      text: 'From supplier identification to delivery — seamless import, export, and procurement coordination.'
    }
  ],
  servicesHeading: 'Services',
  services: [
    'Import & Export Services',
    'International Sourcing',
    'Trade Facilitation',
    'Supplier Identification',
    'Product Procurement',
    'Market Expansion Support',
    'Business Matching Services'
  ],
  benefitsHeading: 'Industries',
  benefits: [
    'Consumer Goods',
    'Industrial Products',
    'Agricultural Products',
    'FMCG',
    'Raw Materials'
  ],
  actions: [
    { label: 'Partner With Us', link: '/contact' },
    { label: 'Contact Us', link: '/contact' }
  ],
  overviewPoints: [
    'Global Trade & Sourcing Solutions',
    'Import / Export Management',
    'International Market Expansion'
  ],
  industries: [
    'Consumer Goods',
    'Industrial Products',
    'Agricultural Products',
    'FMCG',
    'Raw Materials',
    'Packaging Materials',
    'Food Ingredients',
    'Logistics & Supply Chain'
  ],
  clients: ['Exporters', 'Importers', 'Manufacturers', 'Distributors', 'SMEs', 'Corporations'],
  testimonials: [
    'HEXORA helped us source quality products from reliable global suppliers.',
    'Their trade facilitation made our international expansion seamless.',
    'Professional, responsive, and dependable global trade partner.'
  ]
};

export default function GlobalTradePage() {
  return <DivisionPage config={config} />;
}
