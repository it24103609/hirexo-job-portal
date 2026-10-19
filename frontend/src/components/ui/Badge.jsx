import React from 'react';
import clsx from 'clsx';

export default function Badge({ children, tone = 'neutral', className }) {
  return <span className={clsx('badge', `badge-${tone}`, className)}>{children}</span>;
}
