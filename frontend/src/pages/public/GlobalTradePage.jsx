import { Globe2 } from 'lucide-react';
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
  accentClass: 'division-hero-trade',
  hexoraClass: 'hexora-division-trade',
  desc: 'Connecting businesses to global markets.',
  text: 'HEXORA GLOBAL TRADE facilitates international trade partnerships and sourcing solutions, helping businesses expand their reach and access quality products worldwide.',
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