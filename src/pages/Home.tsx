import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles, Star, Trophy, Zap } from "lucide-react";
import Layout from "@/components/Layout";
import PlayerAnalytics from "@/components/PlayerAnalytics";
import { getProfile } from "@/lib/localStorage";

const Home = () => {
  const [topic, setTopic] = useState("");
  const navigate = useNavigate();
  const profile = getProfile();

  const startQuiz = () => {
    if (topic.trim()) {
      navigate(`/quiz?topic=${encodeURIComponent(topic.trim())}`);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning! 🌅";
    if (hour < 18) return "Good afternoon! ☀️";
    return "Good evening! 🌙";
  };

  return (
    <Layout currentPage="home">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Greeting */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-inter font-bold text-foreground mb-2">
            {getGreeting()}
          </h1>
          <p className="text-lg text-muted-foreground">
            Ready to learn something new today?
          </p>
        </div>

        {/* Main Quiz Input */}
        <Card className="mb-8 border-2 border-primary/20 shadow-2xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm hover:border-primary/40 transition-all duration-300">
          <CardContent className="p-6 sm:p-8">
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent animate-float">
                  <Sparkles className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-inter font-bold gradient-text">
                  What sparks your curiosity?
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Enter any topic and dive into personalized questions crafted just for you
                </p>
              </div>
              
              <div className="space-y-4 max-w-lg mx-auto">
                <Input
                  type="text"
                  placeholder="Try 'Quantum Physics' or 'Ancient Rome'..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="h-14 text-lg px-6 rounded-2xl border-2 border-input focus:border-primary transition-colors bg-input/50 backdrop-blur-sm"
                  onKeyPress={(e) => e.key === "Enter" && topic.trim() && startQuiz()}
                />
                
                <Button
                  onClick={startQuiz}
                  disabled={!topic.trim()}
                  size="lg"
                  className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 playful-button disabled:hover:scale-100"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Start Learning
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Motivational Message */}
        <div className="text-center mb-12 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <Trophy className="w-8 h-8 text-warning mx-auto mb-3 animate-bounce-in" />
          <p className="text-lg font-semibold text-foreground mb-2">
            {profile.stars > 0 
              ? `Amazing! You've earned ${profile.stars.toLocaleString()} stars so far! 🌟`
              : "Your learning adventure starts here! 🚀"
            }
          </p>
          <p className="text-muted-foreground">
            Ready to test your knowledge and earn more stars?
          </p>
        </div>

        {/* Player Analytics */}
        <PlayerAnalytics />
      </div>
    </Layout>
  );
};

export default Home;
