import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Phone, MapPin, MessageCircle, Zap, Headphones, Users, Clock, Globe2 } from 'lucide-react';
import Seo from '../../components/ui/Seo';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import { contactSchema } from '../../utils/validators';
import { toast } from 'react-toastify';
import Loader from '../../components/ui/Loader';
import { contactApi } from '../../services/contact.api';
import { siteContent } from '../../data/siteContent';
import './ContactPage.css';

export default function ContactPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({ resolver: zodResolver(contactSchema) });
  const whatsappUrl = `https://wa.me/${siteContent.contact.whatsapp}`;

  const supportItems = [
    { icon: Zap, label: 'Quick Response', desc: 'Typically reply within 24 hours' },
    { icon: Headphones, label: 'Expert Support', desc: 'Dedicated team for hiring needs' },
    { icon: Users, label: 'Candidate Help', desc: 'Full support throughout your journey' },
    { icon: MessageCircle, label: 'WhatsApp Available', desc: 'Chat with us anytime' }
  ];

  return (
    <div>
      <Seo title="Contact HEXORA GLOBAL GROUP" description="Contact HEXORA GLOBAL GROUP (PVT) LTD for Talent Acquisition, HR Consulting, Global Trade, Food Products, and Business Consulting inquiries." />
      
      {/* Hero Section */}
      <section className="contact-hero-shell">
        <div className="contact-hero-ambient contact-hero-ambient-a" aria-hidden="true" />
        <div className="contact-hero-ambient contact-hero-ambient-b" aria-hidden="true" />
        
        <div className="shell">
          <div className="contact-hero-content">
            <span className="contact-badge">HEXORA GLOBAL GROUP (PVT) LTD</span>
            <h1>Your Trusted Partner for Growth & Success</h1>
            <p className="contact-hero-subtitle">
              Empowering Businesses. Connecting Talent. Creating Opportunities.<br />
              Get in touch with us for Talent Acquisition, HR Consulting, Global Trade, Food Products, and Business Consulting.
            </p>
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="contact-main-shell">
        <div className="shell">
          <div className="contact-layout-grid">
            {/* Left Column - Contact Info */}
            <aside className="contact-info-panel">
              <div className="contact-info-intro">
                <h2>Reach out to us</h2>
                <p>
                  Have questions? We'd love to hear from you. Send us a message and our team will 
                  respond as quickly as possible.
                </p>
              </div>

              <div className="contact-info-cards">
                {/* Phone */}
                <a href="tel:+94773191832" className="contact-info-card contact-info-card-interactive">
                  <span className="contact-info-icon"><Phone size={22} /></span>
                  <div className="contact-info-content">
                    <span className="contact-info-label">Phone</span>
                    <span className="contact-info-value">+94 77 319 1832</span>
                  </div>
                </a>

                {/* Email */}
                <a href="mailto:hrm4921@gmail.com" className="contact-info-card contact-info-card-interactive">
                  <span className="contact-info-icon"><Mail size={22} /></span>
                  <div className="contact-info-content">
                    <span className="contact-info-label">Email</span>
                    <span className="contact-info-value">hrm4921@gmail.com</span>
                  </div>
                </a>

                {/* Website */}
                <a href="https://www.hexoraglobal.com" target="_blank" rel="noreferrer" className="contact-info-card contact-info-card-interactive">
                  <span className="contact-info-icon"><Globe2 size={22} /></span>
                  <div className="contact-info-content">
                    <span className="contact-info-label">Website</span>
                    <span className="contact-info-value">www.hexoraglobal.com</span>
                  </div>
                </a>

                {/* WhatsApp */}
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="contact-info-card contact-info-card-interactive">
                  <span className="contact-info-icon"><MessageCircle size={22} /></span>
                  <div className="contact-info-content">
                    <span className="contact-info-label">WhatsApp</span>
                    <span className="contact-info-value">Chat with us</span>
                  </div>
                </a>
              </div>

              {/* Business Hours */}
              <div className="contact-info-hours">
                <span className="contact-hours-icon"><Clock size={18} /></span>
                <div>
                  <strong>Business Hours</strong>
                  <p>Monday - Friday | 9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </aside>

            {/* Right Column - Contact Form */}
            <div className="contact-form-panel">
              <div className="contact-form-header">
                <h2>Send us a message</h2>
                <p>Fill out the form below and we'll get back to you shortly.</p>
              </div>

              <form className="contact-form" onSubmit={handleSubmit(async (values) => {
                try {
                  await contactApi.submit(values);
                  toast.success('Inquiry sent successfully! We\'ll be in touch soon.');
                  reset();
                } catch (error) {
                  toast.error(error.message || 'Failed to send inquiry');
                }
              })}>
                <div className="contact-form-row">
                  <div className="contact-form-field">
                    <Input 
                      label="Full Name" 
                      error={errors.name?.message} 
                      {...register('name')} 
                      placeholder="Your name"
                    />
                  </div>
                  <div className="contact-form-field">
                    <Input 
                      label="Email" 
                      type="email" 
                      error={errors.email?.message} 
                      {...register('email')} 
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="contact-form-field">
                  <Input 
                    label="Subject" 
                    error={errors.subject?.message} 
                    {...register('subject')} 
                    placeholder="What is this about?"
                  />
                </div>

                <div className="contact-form-field">
                  <Textarea 
                    label="Message" 
                    error={errors.message?.message} 
                    {...register('message')} 
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="contact-submit-btn">
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Support & Trust Strip */}
      <section className="contact-support-strip">
        <div className="shell">
          <div className="contact-support-grid">
            {supportItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="contact-support-item">
                  <span className="contact-support-icon">
                    <Icon size={20} />
                  </span>
                  <div className="contact-support-text">
                    <h4>{item.label}</h4>
                    <p>{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}