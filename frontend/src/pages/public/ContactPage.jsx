import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Phone, MapPin, MessageCircle, Zap, Headphones, Users, Clock } from 'lucide-react';
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
    <>
      <Seo title="Contact Hirexo" description="Contact the Hirexo team for hiring inquiries, support, and partnerships." />
      
      {/* Hero Section */}
      <section className="contact-hero-shell">
        <div className="contact-hero-ambient contact-hero-ambient-a" aria-hidden="true" />
        <div className="contact-hero-ambient contact-hero-ambient-b" aria-hidden="true" />
        
        <div className="shell">
          <div className="contact-hero-content">
            <span className="contact-badge">Get in touch</span>
            <h1>Let's talk about your hiring needs</h1>
            <p className="contact-hero-subtitle">
              Whether you're looking to hire top talent, grow your career, or explore partnerships, 
              our team is ready to help you succeed.
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
                {/* Email */}
                <a href={`mailto:${siteContent.contact.email}`} className="contact-info-card contact-info-card-interactive">
                  <span className="contact-info-icon"><Mail size={22} /></span>
                  <div className="contact-info-content">
                    <span className="contact-info-label">Email</span>
                    <span className="contact-info-value">{siteContent.contact.email}</span>
                  </div>
                </a>

                {/* Phone */}
                <a href={`tel:${siteContent.contact.phonePrimary}`} className="contact-info-card contact-info-card-interactive">
                  <span className="contact-info-icon"><Phone size={22} /></span>
                  <div className="contact-info-content">
                    <span className="contact-info-label">Phone</span>
                    <span className="contact-info-value">{siteContent.contact.phonePrimary}</span>
                  </div>
                </a>

                {/* Address */}
                <div className="contact-info-card">
                  <span className="contact-info-icon"><MapPin size={22} /></span>
                  <div className="contact-info-content">
                    <span className="contact-info-label">Address</span>
                    <span className="contact-info-value">{siteContent.contact.address}</span>
                  </div>
                </div>

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
                  <strong>Response Time</strong>
                  <p>We typically respond within 24 hours during business days.</p>
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
    </>
  );
}
