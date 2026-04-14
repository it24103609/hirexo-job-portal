import Seo from '../../components/ui/Seo';
import SectionHeader from '../../components/ui/SectionHeader';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import { siteContent } from '../../data/siteContent';

export default function AboutPage() {
  return (
    <>
      <Seo title="About Hirexo" description="Learn about Hirexo's recruitment-first approach to corporate hiring." />
      <section className="section-block">
        <div className="shell">
          <SectionHeader eyebrow="About us" title="A corporate recruitment platform with a clean workflow" description="Hirexo connects candidates, employers, and admins in one practical system." />
          <div className="grid-2">
            <Card>
              <h3>Our mission</h3>
              <p>{siteContent.mission}</p>
              <h3>Our vision</h3>
              <p>{siteContent.vision}</p>
            </Card>
            <Card>
              <h3>Our values</h3>
              <p>{siteContent.values}</p>
              <div className="grid-2">
                {siteContent.homeStats.slice(0, 4).map((stat) => <StatCard key={stat.label} label={stat.label} value={stat.value} />)}
              </div>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
