import { siteContent } from '../../data/siteContent';

// Real WhatsApp glyph (brand mark) as inline SVG.
// lucide-react does not ship a WhatsApp-branded icon, so we use the
// official WhatsApp logo path here for an authentic look.
function WhatsAppIcon({ size = 30, className = 'floating-whatsapp-icon' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M16.003 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.6 4.47 1.73 6.4L3.2 28.8l6.55-1.71a12.74 12.74 0 0 0 6.25 1.6h.01c7.06 0 12.8-5.74 12.8-12.8 0-3.42-1.33-6.63-3.75-9.05A12.72 12.72 0 0 0 16.003 3.2zm0 23.04h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-3.89 1.02 1.04-3.79-.25-.39a10.58 10.58 0 0 1-1.62-5.66c0-5.86 4.77-10.62 10.63-10.62 2.84 0 5.51 1.11 7.52 3.12a10.56 10.56 0 0 1 3.11 7.51c0 5.86-4.77 10.62-10.63 10.62zm5.83-7.96c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.71.16-.21.32-.82 1.04-1 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.54-.71-.55l-.61-.01c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65 0 1.56 1.14 3.07 1.3 3.28.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.89-.77 2.16-1.52.27-.74.27-1.38.19-1.52-.08-.13-.29-.21-.61-.37z" />
    </svg>
  );
}

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
      <WhatsAppIcon size={30} />
      <span className="floating-whatsapp-badge">1</span>
    </a>
  );
}