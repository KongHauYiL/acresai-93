
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Trophy, Home, RotateCcw, TrendingUp, Zap, Target } from "lucide-react";
import Layout from "@/components/Layout";
import StarAnimation from "@/components/StarAnimation";
import { getProfile } from "@/lib/localStorage";

const Results = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showAnimation, setShowAnimation] = useState(true);
  
  const stars = parseInt(searchParams.get("stars") || "0");
  const correct = parseInt(searchParams.get("correct") || "0");
  const total = parseInt(searchParams.get("total") || "0");
  const profile = getProfile();
  
  const percentage = Math.round((correct / total) * 100);
  
  const getPerformanceMessage = () => {
    if (percentage >= 90) return { text: "Outstanding! You're a genius! 🏆", color: "text-warning" };
    if (percentage >= 80) return { text: "Excellent work! Keep it up! 🎉", color: "text-success" };
    if (percentage >= 70) return { text: "Great job! You're learning fast! 👏", color: "text-accent" };
    if (percentage >= 60) return { text: "Good effort! Keep practicing! 👍", color: "text-primary" };
    return { text: "Every mistake is a step forward! 💪", color: "text-muted-foreground" };
  };

  const performance = getPerformanceMessage();

  const getGradientColor = () => {
    if (percentage >= 90) return 'from-warning via-yellow-400 to-orange-500';
    if (percentage >= 80) return 'from-success via-emerald-400 to-green-500';
    if (percentage >= 70) return 'from-accent via-purple-400 to-pink-500';
    if (percentage >= 60) return 'from-primary via-teal-400 to-cyan-500';
    return 'from-muted-foreground to-muted';
  };

  const encouragingMessages = [
    "Your brain just got stronger! 🧠✨",
    "Knowledge unlocked! Ready for more? 🔓",
    "You're on fire! Keep the momentum going! 🔥",
    "Every question makes you smarter! 📚✨",
    "Learning machine activated! 🤖💫"
  ];

  const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];

  return (
    <Layout>
      {showAnimation && (
        <StarAnimation 
          starsEarned={stars} 
          onComplete={() => setShowAnimation(false)} 
        />
      )}
      
      <div className="container max-w-3xl mx-auto px-4 py-8 sm:py-16">
        <Card className="border-2 border-primary/20 shadow-2xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br ${getGradientColor()} flex items-center justify-center shadow-2xl animate-bounce-in`}>
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl sm:text-4xl font-inter font-bold gradient-text mb-4">
              Quiz Complete! 🎊
            </CardTitle>
            <div className={`text-xl sm:text-2xl font-bold ${performance.color} animate-bounce-in`}>
              {performance.text}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl border-2 border-primary/30 animate-bounce-in">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2 flex items-center justify-center">
                  <Target className="w-6 h-6 mr-2" />
                  {correct}
                </div>
                <div className="text-sm font-medium text-primary/80">Correct Answers</div>
              </div>
              
              <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl border-2 border-accent/30 animate-bounce-in" style={{ animationDelay: '0.1s' }}>
                <div className="text-3xl sm:text-4xl font-bold text-accent mb-2 flex items-center justify-center">
                  <Zap className="w-6 h-6 mr-2" />
                  {percentage}%
                </div>
                <div className="text-sm font-medium text-accent/80">Accuracy Score</div>
              </div>
              
              <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-warning/20 to-warning/10 rounded-2xl border-2 border-warning/30 animate-bounce-in" style={{ animationDelay: '0.2s' }}>
                <div className="text-3xl sm:text-4xl font-bold text-warning mb-2 flex items-center justify-center">
                  <Star className="w-6 h-6 mr-2 fill-warning" />
                  {stars}
                </div>
                <div className="text-sm font-medium text-warning/80">Stars Earned</div>
              </div>
            </div>
            
            {/* Stars Earned Banner */}
            {stars > 0 && (
              <div className="text-center p-6 bg-gradient-to-r from-warning/20 via-yellow-100/20 to-orange-200/20 rounded-2xl border-2 border-warning/30 animate-bounce-in" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center justify-center space-x-3 mb-3">
                  <Star className="w-8 h-8 text-warning fill-warning animate-pulse-glow" />
                  <span className="text-2xl sm:text-3xl font-bold gradient-text">
                    +{stars} Stars Added! 🌟
                  </span>
                  <Star className="w-8 h-8 text-warning fill-warning animate-pulse-glow" />
                </div>
                <p className="text-warning font-semibold text-lg">
                  Total Stars: {profile.stars.toLocaleString()} ⭐
                </p>
              </div>
            )}
            
            {/* Encouragement */}
            <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20 animate-bounce-in" style={{ animationDelay: '0.4s' }}>
              <TrendingUp className="w-8 h-8 text-accent mx-auto mb-3 animate-float" />
              <p className="text-lg sm:text-xl font-bold gradient-text mb-2">
                {randomMessage}
              </p>
              <p className="text-muted-foreground font-medium">
                {percentage >= 80 
                  ? "You're mastering this! Try something even more challenging! 🚀" 
                  : "Every quiz makes you smarter. Your next breakthrough is coming! 💪"
                }
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => navigate("/")}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 py-4 sm:py-6 text-lg font-bold rounded-2xl transition-all duration-300 playful-button"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Try Another Topic
              </Button>
              
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="flex-1 py-4 sm:py-6 text-lg font-medium rounded-2xl border-2 hover:border-primary hover:bg-primary/10 playful-button"
              >
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Results;
