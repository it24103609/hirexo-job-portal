import Seo from '../../components/ui/Seo';
import SectionHeader from '../../components/ui/SectionHeader';
import Card from '../../components/ui/Card';
import { siteContent } from '../../data/siteContent';

export default function ServicesPage() {
  return (
    <>
      <Seo title="Services | Hirexo" description="Recruitment, talent acquisition, and HR services on Hirexo." />
      <section className="section-block">
        <div className="shell">
          <SectionHeader eyebrow="Services" title="What Hirexo helps businesses do" description="A simple service story that fits the corporate recruitment brand." />
          <div className="grid-3">
            {siteContent.services.map((service) => (
              <Card key={service.title}>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
