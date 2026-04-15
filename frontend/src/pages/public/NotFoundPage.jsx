import Seo from '../../components/ui/Seo';
import EmptyState from '../../components/ui/EmptyState';

export default function NotFoundPage() {
  return (
    <>
      <Seo title="Page not found | Hirexo" description="The requested page could not be found." />
      <section className="section-block">
        <div className="shell">
          <EmptyState title="Page not found" description="The page you requested does not exist." actionLabel="Back to home" actionTo="/" />
        </div>
      </section>
    </>
  );
}
