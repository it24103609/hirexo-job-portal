import clsx from 'clsx';

export default function Button({ as: Component = 'button', className, variant = 'primary', size = 'md', ...props }) {
  return (
    <Component
      className={clsx('btn', `btn-${variant}`, `btn-${size}`, className)}
      {...props}
    />
  );
}
