import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/authService';
import { handleApiError } from '@/utils/errorHandler';
import { toast } from 'sonner';

// Stadium background - embedded as base64 for reliability or use local file
const STADIUM_BG = '/stadium-bg.jpg';
// Fallback to a high-quality stock stadium image
const FALLBACK_BG = 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1920&q=80';

// Player silhouette SVG - uses CSS variable for accent color
const PlayerSilhouette = () => (
  <svg viewBox="0 0 200 400" className="w-full h-full" fill="currentColor">
    <defs>
      <linearGradient id="playerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
        <stop offset="50%" className="[stop-color:hsl(var(--accent)/0.2)]" stopColor="currentColor" style={{ stopColor: 'hsl(var(--accent) / 0.2)' }} />
        <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
      </linearGradient>
    </defs>
    {/* Head */}
    <ellipse cx="100" cy="35" rx="25" ry="30" fill="url(#playerGradient)" />
    {/* Neck */}
    <rect x="90" y="60" width="20" height="15" fill="url(#playerGradient)" />
    {/* Torso */}
    <path d="M60 75 L140 75 L150 180 L50 180 Z" fill="url(#playerGradient)" />
    {/* Left arm */}
    <path d="M60 75 L30 140 L40 145 L65 90" fill="url(#playerGradient)" />
    {/* Right arm - raised with ball */}
    <path d="M140 75 L180 100 L175 115 L135 95" fill="url(#playerGradient)" />
    {/* Football in hand */}
    <ellipse cx="185" cy="95" rx="15" ry="10" fill="url(#playerGradient)" />
    {/* Shorts */}
    <path d="M50 180 L150 180 L145 230 L105 230 L100 210 L95 230 L55 230 Z" fill="url(#playerGradient)" />
    {/* Left leg */}
    <path d="M55 230 L45 350 L65 350 L95 230" fill="url(#playerGradient)" />
    {/* Right leg */}
    <path d="M105 230 L135 350 L155 350 L145 230" fill="url(#playerGradient)" />
    {/* Left foot */}
    <ellipse cx="55" cy="360" rx="20" ry="12" fill="url(#playerGradient)" />
    {/* Right foot */}
    <ellipse cx="145" cy="360" rx="20" ry="12" fill="url(#playerGradient)" />
  </svg>
);

// Club Logo Component - uses accent color from theme
const ClubLogo = ({ className = "w-20 h-20" }: { className?: string }) => (
  <div className="relative">
    <svg viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" className="text-accent" style={{ stopColor: 'hsl(var(--accent))' }} />
          <stop offset="50%" style={{ stopColor: 'hsl(var(--accent) / 0.8)' }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))' }} />
        </linearGradient>
        <filter id="logoGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      {/* Shield shape */}
      <path 
        d="M50 5 L90 20 L90 55 Q90 80 50 95 Q10 80 10 55 L10 20 Z" 
        fill="none" 
        stroke="url(#logoGradient)" 
        strokeWidth="3"
        filter="url(#logoGlow)"
      />
      {/* Inner details */}
      <path 
        d="M50 15 L80 27 L80 52 Q80 72 50 85 Q20 72 20 52 L20 27 Z" 
        fill="hsl(var(--accent) / 0.1)" 
        stroke="url(#logoGradient)" 
        strokeWidth="1"
      />
      {/* Star */}
      <path 
        d="M50 25 L53 35 L63 35 L55 42 L58 52 L50 46 L42 52 L45 42 L37 35 L47 35 Z" 
        fill="url(#logoGradient)"
      />
      {/* Football icon */}
      <ellipse cx="50" cy="65" rx="12" ry="8" fill="none" stroke="url(#logoGradient)" strokeWidth="1.5" />
      <path d="M42 65 L58 65 M50 57 L50 73" stroke="url(#logoGradient)" strokeWidth="1" />
    </svg>
  </div>
);

// Floating Input Component - Clean design with theme colors
const FloatingInput = ({ 
  id, 
  type, 
  value, 
  onChange, 
  label, 
  icon: Icon,
  showPasswordToggle,
  showPassword,
  onTogglePassword
}: {
  id: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  icon: React.ElementType;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;

  return (
    <div className="relative group">
      <div className="relative">
        <Icon 
          className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
            isFocused ? 'text-accent' : 'text-white/40'
          }`}
        />
        
        <input
          id={id}
          type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full pl-12 pr-${showPasswordToggle ? '12' : '4'} py-4 
            bg-white/5 backdrop-blur-sm
            border rounded-xl 
            text-white text-base
            transition-all duration-200
            outline-none
            ${isFocused 
              ? 'border-accent bg-white/10' 
              : 'border-white/20 hover:border-white/30'
            }
          `}
          placeholder=" "
        />
        
        {/* Floating label */}
        <label
          htmlFor={id}
          className={`
            absolute left-12 transition-all duration-200 pointer-events-none
            ${isFocused || hasValue
              ? '-top-2.5 text-xs px-2 bg-slate-900 rounded text-accent font-medium'
              : 'top-1/2 -translate-y-1/2 text-white/50 text-base'
            }
          `}
        >
          {label}
        </label>

        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
              isFocused ? 'text-accent' : 'text-white/40 hover:text-white/60'
            }`}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const backgroundRef = useRef<HTMLDivElement>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  // Entrance animations sequence
  useEffect(() => {
    const timer1 = setTimeout(() => setIsLoaded(true), 100);
    const timer2 = setTimeout(() => setTitleVisible(true), 400);
    const timer3 = setTimeout(() => setPanelVisible(true), 800);
    const timer4 = setTimeout(() => setFormVisible(true), 1200);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  // Parallax effect on mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      setMousePosition({ x, y });
      
      // Apply parallax to background
      if (backgroundRef.current) {
        backgroundRef.current.style.transform = `scale(1.1) translate(${-x * 0.5}px, ${-y * 0.5}px)`;
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: () => {
      toast.success('Welcome back, Champion!', {
        description: 'Redirecting to your dashboard...',
      });
      navigate('/dashboard', { replace: true });
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      const { message } = handleApiError(error);
      toast.error(message || 'Login failed. Please check your credentials.');
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen w-full overflow-hidden relative bg-black">
      {/* Full-screen Stadium Background with Parallax */}
      <div 
        ref={backgroundRef}
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{ 
          backgroundImage: `url(${STADIUM_BG}), url(${FALLBACK_BG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: 'scale(1.1)',
        }}
      />
      
      {/* Cinematic dark overlay with depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
      
      {/* Stadium light rays effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 h-full w-1 bg-gradient-to-b from-white/10 via-white/5 to-transparent opacity-30"
            style={{
              left: `${10 + i * 12}%`,
              transform: `rotate(${-15 + i * 4}deg)`,
              transformOrigin: 'top center',
              animation: `lightRay ${3 + i * 0.5}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Floating particles / dust in light */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `floatParticle ${8 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content Container */}
      <div className="relative min-h-screen flex">
        {/* Left Side - Branding & Player Silhouette */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative items-center justify-center p-8">
          {/* Player silhouette with floating animation */}
          <div 
            className={`absolute left-10 bottom-0 w-64 h-[500px] transition-all duration-1000 ease-out ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{
              animation: isLoaded ? 'floatPlayer 6s ease-in-out infinite' : 'none',
              transform: `translateX(${mousePosition.x * 0.3}px) translateY(${mousePosition.y * 0.3}px)`,
            }}
          >
            <PlayerSilhouette />
          </div>

          {/* Club branding - center */}
          <div 
            className={`text-center z-10 transition-all duration-1000 ease-out ${
              titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
            }`}
            style={{
              transform: `perspective(1000px) rotateY(${mousePosition.x * 0.02}deg) rotateX(${-mousePosition.y * 0.02}deg)`,
            }}
          >
            {/* Logo with glow */}
            <div className="flex justify-center mb-8">
              <div 
                className="relative"
                style={{ animation: 'pulse 3s ease-in-out infinite' }}
              >
                <div className="absolute inset-0 blur-2xl bg-accent/30 rounded-full scale-150" />
                <ClubLogo />
              </div>
            </div>

            {/* Club Name with animated reveal */}
            <h1 className="relative">
              <span 
                className="block text-7xl xl:text-8xl font-black tracking-tighter text-white"
              >
                CLUB
              </span>
              <span 
                className="block text-7xl xl:text-8xl font-black tracking-tighter mt-2 text-accent"
              >
                CHAMPION
              </span>
            </h1>

            {/* Tagline */}
            <p 
              className={`mt-6 text-xl text-white/60 font-light tracking-wide transition-all duration-700 delay-300 ${
                titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
            >
              Where Legends Are Born
            </p>

            {/* Stats Row */}
            <div 
              className={`mt-12 flex justify-center gap-12 transition-all duration-700 delay-500 ${
                titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
            >
              {[
                { value: '500+', label: 'Athletes' },
                { value: '50+', label: 'Teams' },
                { value: '25', label: 'Trophies' },
              ].map((stat, i) => (
                <div 
                  key={i}
                  className="text-center group cursor-default"
                >
                  <div 
                    className="text-4xl font-bold text-white group-hover:text-accent transition-colors duration-300"
                    style={{ textShadow: '0 0 30px rgba(255,255,255,0.3)' }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/40 mt-1 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative corner elements */}
          <div className="absolute top-8 left-8 w-24 h-24 border-l-2 border-t-2 border-accent/30 rounded-tl-3xl" />
          <div className="absolute bottom-8 left-8 w-24 h-24 border-l-2 border-b-2 border-accent/30 rounded-bl-3xl" />
        </div>

        {/* Right Side - Sliding Login Panel */}
        <div 
          className={`w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 md:p-12 transition-all duration-1000 ${
            panelVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          {/* Glassmorphism Login Card */}
          <div 
            className="w-full max-w-md relative"
            style={{
              perspective: '1000px',
            }}
          >
            {/* Card glow effect - subtle */}
            <div className="absolute -inset-1 bg-accent/10 rounded-3xl blur-2xl opacity-50" />
            
            {/* Main Card */}
            <div 
              className="relative bg-black/50 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden"
              style={{
                transform: `rotateY(${mousePosition.x * 0.02}deg) rotateX(${-mousePosition.y * 0.02}deg)`,
                transformStyle: 'preserve-3d',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
              }}
            >
              {/* Top accent line */}
              <div className="h-1 bg-accent" />
              
              {/* Card Content */}
              <div className="p-8 md:p-10">
                {/* Mobile Logo */}
                <div className="lg:hidden flex justify-center mb-6">
                  <ClubLogo />
                </div>

                {/* Header with slide up animation */}
                <div 
                  className={`text-center mb-10 transition-all duration-700 ease-out ${
                    formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                >
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Welcome Back
                  </h2>
                  <p className="text-white/50">
                    Sign in to access your club dashboard
                  </p>
                </div>

                {/* Login Form with slide up animation */}
                <form 
                  onSubmit={handleLogin} 
                  className={`space-y-6 transition-all duration-700 delay-200 ease-out ${
                    formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                >
                  <FloatingInput
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    label="Email Address"
                    icon={Mail}
                  />

                  <FloatingInput
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    label="Password"
                    icon={Lock}
                    showPasswordToggle
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                  />

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    disabled={loginMutation.isPending}
                    className="w-full py-6 text-lg font-semibold rounded-xl relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg"
                  >
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                    
                    {/* Button border glow on hover */}
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                      style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.2)' }} 
                    />
                    
                    {loginMutation.isPending ? (
                      <span className="flex items-center justify-center gap-3 relative z-10">
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Authenticating...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-3 relative z-10">
                        Enter The Arena
                        <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div 
                  className={`mt-10 flex items-center gap-4 transition-all duration-700 delay-400 ease-out ${
                    formVisible ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <span className="text-white/20 text-xs uppercase tracking-widest">Secure Access</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>

                {/* Security Badge */}
                <div 
                  className={`mt-6 flex justify-center transition-all duration-700 delay-500 ease-out ${
                    formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                  }`}
                >
                  <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                    <Shield className="w-4 h-4 text-accent" />
                    <span className="text-xs text-white/40">256-bit SSL Encrypted</span>
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Card reflection */}
            <div 
              className="absolute -bottom-8 left-4 right-4 h-16 rounded-3xl opacity-20 blur-xl bg-accent/30"
              style={{
                transform: 'scaleY(-0.5)',
              }}
            />
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes floatParticle {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100vh) translateX(20px);
            opacity: 0;
          }
        }
        
        @keyframes floatPlayer {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes lightRay {
          0% {
            opacity: 0.1;
            transform: rotate(var(--rotation, 0deg)) scaleY(0.8);
          }
          100% {
            opacity: 0.3;
            transform: rotate(var(--rotation, 0deg)) scaleY(1);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            transform: scale(1.05);
            filter: brightness(1.2);
          }
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeInUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .player-silhouette {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
