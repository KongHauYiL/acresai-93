import { useEffect, useState } from 'react';
import { Star, Sparkles } from 'lucide-react';

interface StarAnimationProps {
  starsEarned: number;
  onComplete: () => void;
}

const StarAnimation = ({ starsEarned, onComplete }: StarAnimationProps) => {
  const [currentStar, setCurrentStar] = useState(0);
  const [showBurst, setShowBurst] = useState(false);

  useEffect(() => {
    if (currentStar < starsEarned) {
      // Calculate delay to ensure animation completes within 5 seconds max
      const maxAnimationTime = 5000; // 5 seconds in milliseconds
      const delayPerStar = starsEarned > 0 ? Math.min(200, maxAnimationTime / starsEarned) : 200;
      
      const timer = setTimeout(() => {
        setCurrentStar(prev => prev + 1);
        if (currentStar === 0) setShowBurst(true);
      }, delayPerStar);
      return () => clearTimeout(timer);
    } else if (currentStar === starsEarned && starsEarned > 0) {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStar, starsEarned, onComplete]);

  if (starsEarned === 0) {
    setTimeout(onComplete, 100);
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center space-y-6">
        {showBurst && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-32 h-32 text-warning animate-star-burst opacity-60" />
          </div>
        )}
        
        <div className="relative z-10">
          <div className="text-6xl font-bold gradient-text mb-4 animate-bounce-in">
            Amazing!
          </div>
          
          <div className="flex items-center justify-center space-x-2 mb-6">
            <span className="text-2xl font-semibold text-foreground">+{currentStar}</span>
            <Star className="w-8 h-8 text-warning fill-warning animate-pulse-glow" />
          </div>
          
          <div className="grid grid-cols-5 gap-2 max-w-xs mx-auto">
            {Array.from({ length: Math.min(starsEarned, 10) }).map((_, i) => (
              <Star
                key={i}
                className={`w-6 h-6 transition-all duration-300 ${
                  i < currentStar
                    ? 'text-warning fill-warning scale-110 animate-pulse-glow'
                    : 'text-muted-foreground'
                }`}
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
          
          {starsEarned > 10 && (
            <div className="text-sm text-muted-foreground mt-2">
              +{starsEarned - 10} more stars!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StarAnimation;
