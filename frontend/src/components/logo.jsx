import logoImg from '@/assets/logo.png';

export const LogoIcon = ({ className = 'size-7 object-contain rounded-md shadow-sm', ...props }) => (
  <img src={logoImg} alt="WanderSync Logo" className={className} {...props} />
);

export const Logo = ({ className = 'size-7 object-contain rounded-md shadow-sm', ...props }) => (
  <div className="flex items-center gap-2">
    <img src={logoImg} alt="WanderSync Logo" className={className} {...props} />
    <span className="font-bold text-base tracking-tight text-white font-['Instrument_Serif'] italic text-xl">WanderSync</span>
  </div>
);
