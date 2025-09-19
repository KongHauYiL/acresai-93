
interface ProgressBarProps {
  progress: number;
  message: string;
}

const ProgressBar = ({ progress, message }: ProgressBarProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/20 p-6 z-50">
      <div className="max-w-md mx-auto space-y-4">
        <div className="text-center space-y-2">
          <p className="text-white font-semibold text-lg">{message}</p>
          <p className="text-white/60">{progress}% complete</p>
        </div>
        
        <div className="relative">
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-sm animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
