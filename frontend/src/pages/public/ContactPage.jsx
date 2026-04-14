import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Seo from '../../components/ui/Seo';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import { contactSchema } from '../../utils/validators';
import { toast } from 'react-toastify';
import Loader from '../../components/ui/Loader';
import { contactApi } from '../../services/contact.api';
import { siteContent } from '../../data/siteContent';

export default function ContactPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({ resolver: zodResolver(contactSchema) });
  const whatsappUrl = `https://wa.me/${siteContent.contact.whatsapp}`;

  return (
    <>
      <Seo title="Contact Hirexo" description="Contact the Hirexo team for hiring inquiries, support, and partnerships." />
      <section className="section-block">
        <div className="shell grid-2">
          <Card>
            <h1>Contact us</h1>
            <p>{siteContent.contact.prompt}</p>
            <p><strong>Phone:</strong> {siteContent.contact.phonePrimary} / {siteContent.contact.phoneSecondary}</p>
            <p><strong>Email:</strong> {siteContent.contact.email}</p>
            <p><strong>Address:</strong> {siteContent.contact.address}</p>
            <a className="whatsapp-link" href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a>
          </Card>
          <Card>
            <form className="form-grid" onSubmit={handleSubmit(async (values) => {
              try {
                await contactApi.submit(values);
                toast.success('Inquiry sent successfully');
                reset();
              } catch (error) {
                toast.error(error.message || 'Failed to send inquiry');
              }
            })}>
              <Input label="Name" error={errors.name?.message} {...register('name')} />
              <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
              <Input label="Subject" error={errors.subject?.message} {...register('subject')} />
              <Textarea label="Message" error={errors.message?.message} {...register('message')} />
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send inquiry'}</Button>
            </form>
          </Card>
        </div>
      </section>
    </>
  );
}
