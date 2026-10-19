import Button from './Button';

export default function EmptyState({ title, description, actionLabel, actionTo, onAction }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel ? (
        <Button as={actionTo ? 'a' : 'button'} href={actionTo} onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
