import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';

const schema = z.object({
  coverLetter: z.string().min(20, 'Cover letter should be at least 20 characters')
});

export default function JobApplicationForm({ onSubmit, disabled = false }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { coverLetter: '' }
  });

  return (
    <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
      <Textarea label="Cover Letter" rows={6} placeholder="Write a short introduction and why you fit this role." error={errors.coverLetter?.message} {...register('coverLetter')} />
      <Button type="submit" disabled={disabled || isSubmitting}>Apply now</Button>
    </form>
  );
}
