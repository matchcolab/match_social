import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { 
  CheckCircle, 
  Circle, 
  Lock, 
  Users, 
  FileText, 
  Shield, 
  Crown, 
  Play,
  ArrowRight 
} from "lucide-react";

export default function OnboardingProgress() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    return <div>Loading...</div>;
  }

  const onboardingStatus = (user as any).onboardingStatus || 'account_created';
  
  const steps = [
    {
      id: 'account_created',
      title: 'Account Created',
      description: 'Basic account setup complete',
      icon: CheckCircle,
      completed: true,
      locked: false,
    },
    {
      id: 'social_profile_completed',
      title: 'Social Profile',
      description: 'Join group activities and discussions',
      icon: onboardingStatus === 'social_profile_completed' || isStepCompleted(onboardingStatus, 'social_profile_completed') ? CheckCircle : Circle,
      completed: isStepCompleted(onboardingStatus, 'social_profile_completed'),
      locked: false,
      action: () => setLocation('/onboarding/social-profile'),
    },
    {
      id: 'full_profile_completed',
      title: 'Complete Profile',
      description: 'Enable verification and subscription eligibility',
      icon: isStepCompleted(onboardingStatus, 'full_profile_completed') ? CheckCircle : FileText,
      completed: isStepCompleted(onboardingStatus, 'full_profile_completed'),
      locked: !isStepCompleted(onboardingStatus, 'social_profile_completed'),
      action: () => setLocation('/onboarding/full-profile'),
    },
    {
      id: 'verified',
      title: 'Get Verified',
      description: 'Video call verification for trusted member status',
      icon: isStepCompleted(onboardingStatus, 'verified') ? CheckCircle : Shield,
      completed: isStepCompleted(onboardingStatus, 'verified'),
      locked: !isStepCompleted(onboardingStatus, 'full_profile_completed'),
      action: () => setLocation('/onboarding/verification'),
    },
    {
      id: 'subscribed',
      title: 'Premium Access',
      description: 'Request personalized introductions',
      icon: isStepCompleted(onboardingStatus, 'subscribed') ? CheckCircle : Crown,
      completed: isStepCompleted(onboardingStatus, 'subscribed'),
      locked: !isStepCompleted(onboardingStatus, 'verified'),
      action: () => setLocation('/onboarding/subscription'),
    },
  ];

  const progressPercentage = (steps.filter(step => step.completed).length / steps.length) * 100;
  const currentStep = steps.find(step => !step.completed && !step.locked);

  function isStepCompleted(currentStatus: string, stepId: string): boolean {
    const statusOrder = ['account_created', 'social_profile_completed', 'full_profile_completed', 'verified', 'subscribed'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepId);
    return stepIndex <= currentIndex;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Welcome to Match Colab!</h1>
          <p className="text-muted-foreground text-lg mb-6">
            Complete your onboarding to unlock all features of our community
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLocked = step.locked;
            const isCurrent = currentStep?.id === step.id;
            
            return (
              <Card 
                key={step.id} 
                className={`relative ${isCurrent ? 'ring-2 ring-primary' : ''} ${isLocked ? 'opacity-60' : ''}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        step.completed 
                          ? 'bg-green-100 text-green-600' 
                          : isCurrent 
                          ? 'bg-primary/10 text-primary' 
                          : isLocked 
                          ? 'bg-muted text-muted-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {isLocked ? <Lock className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{step.title}</CardTitle>
                        <CardDescription>{step.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {step.completed && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Complete
                        </Badge>
                      )}
                      {isCurrent && (
                        <Badge variant="default">
                          Next Step
                        </Badge>
                      )}
                      {isLocked && (
                        <Badge variant="secondary">
                          Locked
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                {!step.completed && !isLocked && step.action && (
                  <CardContent className="pt-0">
                    <Button onClick={step.action} className="w-full">
                      {isCurrent ? (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Start This Step
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Ready to Connect?</h3>
              <p className="text-muted-foreground mb-4">
                You can start participating in community activities at any time. Complete more steps to unlock additional features.
              </p>
              <Button onClick={() => setLocation('/')} variant="outline">
                Explore Community
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}