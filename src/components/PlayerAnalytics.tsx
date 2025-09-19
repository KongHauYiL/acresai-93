
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Trophy } from "lucide-react";
import { getProfile, getStarMilestone } from "@/lib/localStorage";

const PlayerAnalytics = () => {
  const profile = getProfile();
  const milestone = getStarMilestone(profile.stars);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {/* Accuracy */}
      <Card className="bg-gradient-to-br from-card to-card/50 border-2 border-accent/20 hover:border-accent/40 transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Accuracy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-bold text-accent">
            {profile.totalQuestions > 0 ? Math.round((profile.totalCorrect / profile.totalQuestions) * 100) : 0}%
          </div>
          <div className="text-xs text-muted-foreground">
            all time average
          </div>
          <Progress 
            value={profile.totalQuestions > 0 ? (profile.totalCorrect / profile.totalQuestions) * 100 : 0} 
            className="h-2"
          />
          <div className="text-xs text-accent/80">
            {profile.totalCorrect} / {profile.totalQuestions} correct
          </div>
        </CardContent>
      </Card>

      {/* Star Milestone */}
      <Card className="bg-gradient-to-br from-card to-card/50 border-2 border-success/20 hover:border-success/40 transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <Trophy className="w-4 h-4 mr-2" />
            Next Milestone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-bold text-success">
            {milestone.next.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">
            stars to unlock
          </div>
          <Progress 
            value={milestone.progress} 
            className="h-2"
          />
          <div className="text-xs text-success/80">
            Current: {profile.stars.toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerAnalytics;
