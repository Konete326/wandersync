import logoImg from '@/assets/logo.png';

export const LogoIcon = ({ className = 'h-6 w-auto object-contain', ...props }) => (
  <img src={logoImg} alt="WanderSync Logo" className={className} {...props} />
);

export const Logo = ({ className = 'h-7 w-auto object-contain', ...props }) => (
  <div className="flex items-center gap-2">
    <img src={logoImg} alt="WanderSync Logo" className={className} {...props} />
    <span className="font-bold text-base tracking-tight text-white">WanderSync</span>
  </div>
);
