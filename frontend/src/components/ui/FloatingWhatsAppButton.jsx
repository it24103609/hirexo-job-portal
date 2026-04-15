import { MessageCircle } from 'lucide-react';
import { siteContent } from '../../data/siteContent';

export default function FloatingWhatsAppButton() {
  const whatsappUrl = `https://wa.me/${siteContent.contact.whatsapp}`;

  return (
    <a
      className="floating-whatsapp"
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
    >
      <MessageCircle size={30} strokeWidth={2.2} />
      <span className="floating-whatsapp-badge">1</span>
    </a>
  );
}
