import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { CANDIDATE_SOURCE_OPTIONS } from '../../utils/applicationMeta';

const schema = z.object({
  candidateSource: z.string().min(1, 'Please choose a source'),
  coverLetter: z.string().min(20, 'Cover letter should be at least 20 characters')
});

export default function JobApplicationForm({ onSubmit, disabled = false }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { candidateSource: 'Hirexo Portal', coverLetter: '' }
  });

  return (
    <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
      <Select label="How did you find this job?" error={errors.candidateSource?.message} {...register('candidateSource')}>
        {CANDIDATE_SOURCE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
      </Select>
      <Textarea label="Cover Letter" rows={6} placeholder="Write a short introduction and why you fit this role." error={errors.coverLetter?.message} {...register('coverLetter')} />
      <Button type="submit" disabled={disabled || isSubmitting}>Apply now</Button>
    </form>
  );
}
