
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, SkipForward, Star } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { generateQuestions, checkAnswer, Question } from "@/lib/apiService";
import { getProfile, updateProfile, useToken, canEarnStars } from "@/lib/localStorage";

const Quiz = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const topic = searchParams.get("topic") || "";
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    stars: 0,
  });
  const [isLimboMode, setIsLimboMode] = useState(false);
  const [limboQuestions, setLimboQuestions] = useState<Question[]>([]);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  useEffect(() => {
    const loadQuestions = async () => {
      if (!topic) {
        navigate("/");
        return;
      }

      try {
        const generatedQuestions = await generateQuestions(topic, 15);
        setQuestions(generatedQuestions);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load questions:', error);
        toast.error("Failed to generate questions. Please try again.");
        navigate("/");
      }
    };

    loadQuestions();
  }, [topic, navigate]);

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) return;
    
    const result = checkAnswer(userAnswer, currentQuestion.correct_answer, currentQuestion.question_type);
    setIsCorrect(result.isCorrect);
    setExplanation(result.explanation);
    setShowResult(true);
    
    const profile = getProfile();
    
    // Update profile
    updateProfile({
      totalQuestions: profile.totalQuestions + 1,
    });
    
    if (result.isCorrect) {
      const starsToEarn = canEarnStars() ? 2 : 0;
      const newStats = {
        correct: sessionStats.correct + 1,
        stars: sessionStats.stars + starsToEarn,
      };
      setSessionStats(newStats);
      
      // Update profile
      updateProfile({
        totalCorrect: profile.totalCorrect + 1,
      });
      
      setQuestionsAnswered(prev => prev + 1);
    } else if (isLimboMode) {
      // If wrong answer in limbo mode, end the game
      endQuiz();
      return;
    }
  };

  const handleSkipQuestion = () => {
    if (useToken()) {
      toast.success("Question skipped! 🚀");
      handleNextQuestion();
    } else {
      toast.error("No skip tokens remaining! 😔");
    }
  };

  const endQuiz = () => {
    const profile = getProfile();
    updateProfile({
      stars: profile.stars + sessionStats.stars,
    });
    
    navigate(`/results?stars=${sessionStats.stars}&correct=${sessionStats.correct}&total=${questionsAnswered}`);
  };

  const shuffleArray = (array: Question[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleNextQuestion = () => {
    // Check if we've answered all 15 initial questions
    if (!isLimboMode && currentQuestionIndex === 14) {
      // Enter limbo mode
      setIsLimboMode(true);
      const shuffledQuestions = shuffleArray(questions);
      setLimboQuestions(shuffledQuestions);
      setCurrentQuestionIndex(0);
      toast.success("🌟 LIMBO MODE ACTIVATED! 🌟\nAnswer correctly to continue, one wrong answer ends the game!", {
        duration: 4000,
      });
    } else if (isLimboMode) {
      // In limbo mode, cycle through shuffled questions
      const nextIndex = (currentQuestionIndex + 1) % limboQuestions.length;
      if (nextIndex === 0) {
        // Reshuffle when we complete a cycle
        const reshuffled = shuffleArray(limboQuestions);
        setLimboQuestions(reshuffled);
      }
      setCurrentQuestionIndex(nextIndex);
    } else {
      // Normal progression through initial 15 questions
      setCurrentQuestionIndex(prev => prev + 1);
    }
    
    setUserAnswer("");
    setShowResult(false);
    setExplanation("");
  };

  if (!topic) {
    navigate("/");
    return null;
  }

  const currentQuestion = isLimboMode ? limboQuestions[currentQuestionIndex] : questions[currentQuestionIndex];
  const profile = getProfile();

  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-2xl mx-auto px-4 py-8 sm:py-16">
          <div className="text-center space-y-8">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-inter font-bold gradient-text">
                Crafting your adventure...
              </h2>
              <p className="text-muted-foreground text-lg">
                AI is preparing amazing questions about {topic}
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <Layout>
        <div className="container max-w-2xl mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-3xl font-inter font-bold">Oops! Something went wrong</h2>
            <p className="text-xl text-muted-foreground">Failed to generate questions. Let's try again!</p>
            <Button 
              onClick={() => navigate("/")} 
              className="mt-6 bg-gradient-to-r from-primary to-accent px-8 py-4 text-lg rounded-xl playful-button"
            >
              Go Back Home
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="px-4 py-3 rounded-xl font-medium playful-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back Home
          </Button>
          
          <div className="flex items-center space-x-4 bg-card border border-border px-4 sm:px-6 py-3 rounded-2xl shadow-lg backdrop-blur-sm">
            {isLimboMode ? (
              <div className="text-sm font-medium text-warning animate-pulse">
                🌟 LIMBO MODE 🌟
              </div>
            ) : (
              <div className="text-sm font-medium text-muted-foreground">
                <span className="hidden sm:inline">Question </span>{currentQuestionIndex + 1} of 15
              </div>
            )}
            {!isLimboMode && (
              <div className="w-16 sm:w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                  style={{ width: `${((currentQuestionIndex + 1) / 15) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Topic Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-inter font-bold gradient-text">
            {topic}
          </h1>
          {isLimboMode && (
            <p className="text-warning font-medium mt-2 animate-pulse">
              One wrong answer ends the game! Questions answered: {questionsAnswered}
            </p>
          )}
        </div>

        {/* Main Quiz Card */}
        <Card className={`border-2 shadow-2xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm ${
          isLimboMode ? 'border-warning/50 shadow-warning/20' : 'border-primary/20'
        }`}>
          <CardContent className="p-4 sm:p-8">
            {/* Question */}
            <div className="mb-8">
              <div className={`p-4 sm:p-6 rounded-2xl border ${
                isLimboMode 
                  ? 'bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20'
                  : 'bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20'
              }`}>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground leading-relaxed text-center">
                  {currentQuestion?.question_text}
                </h3>
              </div>
            </div>

            {!showResult ? (
              <div className="space-y-6">
                {currentQuestion?.question_type === "multiple_choice" ? (
                  <div className="space-y-3">
                    {currentQuestion.options?.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className={`w-full justify-start text-left p-4 sm:p-6 text-base sm:text-lg rounded-2xl transition-all duration-300 border-2 min-h-14 sm:min-h-16 playful-button ${
                          userAnswer === option
                            ? "bg-gradient-to-r from-primary/20 to-accent/20 border-primary text-foreground scale-[1.02]"
                            : "hover:border-primary/50 hover:bg-primary/5"
                        }`}
                        onClick={() => setUserAnswer(option)}
                      >
                        <span className="bg-muted text-muted-foreground rounded-xl px-3 py-1 mr-4 font-bold text-sm">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1">{option}</span>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setUserAnswer("true")}
                      className={`py-6 sm:py-8 text-lg sm:text-xl rounded-2xl transition-all duration-300 border-2 playful-button ${
                        userAnswer === "true"
                          ? "bg-gradient-to-r from-success/20 to-success/10 border-success text-success scale-[1.02]"
                          : "hover:border-success/50 hover:bg-success/5"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="text-3xl">✓</div>
                        <span className="font-semibold">True</span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setUserAnswer("false")}
                      className={`py-6 sm:py-8 text-lg sm:text-xl rounded-2xl transition-all duration-300 border-2 playful-button ${
                        userAnswer === "false"
                          ? "bg-gradient-to-r from-destructive/20 to-destructive/10 border-destructive text-destructive scale-[1.02]"
                          : "hover:border-destructive/50 hover:bg-destructive/5"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="text-3xl">✗</div>
                        <span className="font-semibold">False</span>
                      </div>
                    </Button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!userAnswer.trim()}
                    size="lg"
                    className="flex-1 py-4 sm:py-6 text-lg sm:text-xl font-bold rounded-2xl transition-all duration-300 playful-button bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 disabled:hover:scale-100"
                  >
                    Submit Answer
                  </Button>
                  
                  {profile.tokens > 0 && (
                    <Button
                      onClick={handleSkipQuestion}
                      variant="outline"
                      size="lg"
                      className="sm:w-auto py-4 sm:py-6 px-4 sm:px-6 text-base sm:text-lg font-medium rounded-2xl border-2 border-warning/50 text-warning hover:bg-warning/10 playful-button"
                    >
                      <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Skip ({profile.tokens})
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className={`text-center py-6 sm:py-8 px-4 sm:px-6 rounded-2xl text-xl sm:text-2xl font-bold border-2 ${
                  isCorrect 
                    ? "bg-gradient-to-r from-success/20 to-success/10 border-success text-success" 
                    : "bg-gradient-to-r from-destructive/20 to-destructive/10 border-destructive text-destructive"
                }`}>
                  {isCorrect ? (
                    <div className="space-y-3">
                      <div className="text-4xl sm:text-5xl animate-bounce-in">🎉</div>
                      <div>Brilliant!</div>
                      {canEarnStars() && <div className="text-lg text-warning flex items-center justify-center">
                        <Star className="w-5 h-5 mr-1 fill-warning" />
                        +2 Stars
                      </div>}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-4xl sm:text-5xl animate-bounce-in">😅</div>
                      <div>{isLimboMode ? "Game Over!" : "Not quite!"}</div>
                    </div>
                  )}
                </div>
                
                <div className="bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 p-4 sm:p-6 rounded-2xl">
                  <p className="text-accent text-base sm:text-lg leading-relaxed font-medium">
                    {explanation}
                  </p>
                </div>

                <Button
                  onClick={handleNextQuestion}
                  size="lg"
                  className="w-full py-4 sm:py-6 text-lg sm:text-xl font-bold rounded-2xl bg-gradient-to-r from-primary to-accent transition-all duration-300 playful-button"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>
                      {isLimboMode && !isCorrect ? "See Results! 🎊" : "Next Question"}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Quiz;
