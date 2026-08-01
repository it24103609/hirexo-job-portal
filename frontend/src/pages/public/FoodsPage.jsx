import { Utensils } from 'lucide-react';
import DivisionPage from './DivisionPage';

const config = {
  id: 'foods',
  seoTitle: 'HEXORA FOODS | Quality Food Products',
  seoDescription: 'Delivering trusted and high-quality packaged food products to consumers, meeting international standards.',
  badgeLabel: 'HEXORA FOODS',
  title: 'HEXORA',
  spanTitle: 'FOODS',
  tagline: 'Quality Food Products',
  icon: Utensils,
  accentClass: 'division-hero-foods',
  hexoraClass: 'hexora-division-foods',
  desc: 'Delivering trusted and high-quality packaged food products to consumers.',
  text: 'HEXORA FOODS is committed to providing nutritious, affordable, and quality food products that meet international standards.',
  servicesHeading: 'Product Categories',
  services: [
    'Spices & Seasonings',
    'Packaged Food Products',
    'Dry Foods',
    'Food Ingredients',
    'Specialty Food Products'
  ],
  benefitsHeading: 'Our Commitment',
  benefits: [
    'Quality',
    'Freshness',
    'Trust',
    'Customer Satisfaction'
  ],
  actions: [
    { label: 'Explore Our Products', link: '/contact' },
    { label: 'Contact Us', link: '/contact' }
  ],
  overviewPoints: [
    'Quality Food Products',
    'International Standards',
    'Affordable & Nutritious'
  ],
  industries: [
    'Retail & FMCG',
    'Food & Beverage',
    'Hospitality',
    'Supermarkets & Grocers',
    'Export Markets',
    'Specialty & Gourmet'
  ],
  clients: ['Retailers', 'Supermarkets', 'HoReCa', 'Distributors', 'Exporters', 'Consumers'],
  testimonials: [
    'HEXORA FOODS delivers consistent quality and freshness every time.',
    'Their packaged products meet international quality standards.',
    'Reliable, trustworthy, and a favorite among our customers.'
  ]
};

export default function FoodsPage() {
  return <DivisionPage config={config} />;
}