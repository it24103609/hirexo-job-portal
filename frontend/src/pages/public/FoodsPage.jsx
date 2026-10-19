import { Award, Leaf, Truck, Utensils } from 'lucide-react';
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
  desc: 'Delivering trusted and high-quality packaged food products to consumers.',
  text: 'HEXORA FOODS is committed to providing nutritious, affordable, and quality food products that meet international standards.',
  heroImage: 'https://images.unsplash.com/photo-1502741126161-b048400d6f00?auto=format&fit=crop&w=1920&q=85',
  heroImageAlt: 'Fresh food products and spices',
  ctaImage: 'https://images.unsplash.com/photo-1498837167922-ddd27525fc3d?auto=format&fit=crop&w=1920&q=85',
  stats: [
    { value: '100+', label: 'Product Lines' },
    { value: 'ISO', label: 'Quality Certified' },
    { value: '15+', label: 'Export Markets' }
  ],
  highlights: [
    {
      icon: Award,
      title: 'Quality Standards',
      text: 'Every product meets rigorous quality checks and international food safety standards.'
    },
    {
      icon: Leaf,
      title: 'Fresh Supply Chain',
      text: 'From farm to shelf — a reliable supply chain ensuring freshness and traceability.'
    },
    {
      icon: Truck,
      title: 'Export Ready',
      text: 'Packaged and certified for domestic retail and international export markets.'
    }
  ],
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
