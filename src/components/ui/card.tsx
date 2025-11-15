import React from 'react';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`glass rounded-3xl border border-border/30 bg-card/40 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_60px_hsl(var(--cosmic-purple)/0.15)] ${className}`.trim()}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  ...props
}) => <div className={`mb-6 ${className}`.trim()} {...props} />;

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  ...props
}) => <h2 className={`text-2xl font-semibold text-white ${className}`.trim()} {...props} />;

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  ...props
}) => <p className={`text-sm text-muted-foreground ${className}`.trim()} {...props} />;

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  ...props
}) => <div className={`space-y-4 ${className}`.trim()} {...props} />;

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  ...props
}) => <div className={`mt-6 flex flex-col gap-2 ${className}`.trim()} {...props} />;
