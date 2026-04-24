import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Input from '../ui/Input';
import { CANDIDATE_SOURCE_OPTIONS } from '../../utils/applicationMeta';

const schema = z.object({
  candidateSource: z.string().min(1, 'Please choose a source'),
  coverLetter: z.string().min(20, 'Cover letter should be at least 20 characters')
});

function ScreeningField({ question, register, index }) {
  const fieldName = `screeningAnswers.${index}.answer`;

  if (question.type === 'textarea') {
    return <Textarea label={question.question} rows={4} placeholder="Your answer" {...register(fieldName)} />;
  }

  if (question.type === 'yes_no') {
    return (
      <Select label={question.question} {...register(fieldName)}>
        <option value="">Select</option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </Select>
    );
  }

  if (question.type === 'number') {
    return <Input label={question.question} type="number" placeholder="Enter a number" {...register(fieldName)} />;
  }

  if (question.type === 'select') {
    return (
      <Select label={question.question} {...register(fieldName)}>
        <option value="">Select</option>
        {(question.options || []).map((option) => <option key={option} value={option}>{option}</option>)}
      </Select>
    );
  }

  return <Input label={question.question} placeholder="Your answer" {...register(fieldName)} />;
}

export default function JobApplicationForm({ onSubmit, disabled = false, screeningQuestions = [] }) {
  const defaultAnswers = screeningQuestions.map((question) => ({
    questionId: question._id,
    answer: ''
  }));

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { candidateSource: 'Hirexo Portal', coverLetter: '', screeningAnswers: defaultAnswers }
  });

  return (
    <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
      <Select label="How did you find this job?" error={errors.candidateSource?.message} {...register('candidateSource')}>
        {CANDIDATE_SOURCE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
      </Select>
      <Textarea label="Cover Letter" rows={6} placeholder="Write a short introduction and why you fit this role." error={errors.coverLetter?.message} {...register('coverLetter')} />
      {screeningQuestions.length ? (
        <>
          <strong>Screening Questions</strong>
          {screeningQuestions.map((question, index) => (
            <ScreeningField key={question._id || `${question.question}-${index}`} question={question} register={register} index={index} />
          ))}
        </>
      ) : null}
      <Button type="submit" disabled={disabled || isSubmitting}>Apply now</Button>
    </form>
  );
}
