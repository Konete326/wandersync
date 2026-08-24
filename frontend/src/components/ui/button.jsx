import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none cursor-pointer focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
  {
    variants: {
      variant: {
        default: 'bg-white text-zinc-950 font-semibold hover:bg-zinc-200',
        brand: 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold',
        outline:
          'border-border bg-background hover:bg-secondary text-foreground hover:text-foreground',
        secondary:
          'bg-secondary text-foreground hover:bg-secondary/80 border border-border',
        ghost:
          'hover:bg-secondary text-muted-foreground hover:text-foreground',
        destructive:
          'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 border border-rose-500/20',
        link: 'text-cyan-400 underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-8 gap-1.5 px-3 text-xs sm:text-sm',
        xs: 'h-6 gap-1 rounded-md px-2 text-xs',
        sm: 'h-7 gap-1 rounded-md px-2.5 text-xs',
        lg: 'h-10 gap-2 px-4 text-sm font-semibold',
        icon: 'size-8',
        'icon-xs': 'size-6 rounded-md',
        'icon-sm': 'size-7 rounded-md',
        'icon-lg': 'size-9'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
