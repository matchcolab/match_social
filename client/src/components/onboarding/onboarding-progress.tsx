import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Lock, ArrowRight } from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'locked';
  route?: string;
}

export default function OnboardingProgress() {
  const { user } = useAuth();
  const onboardingStatus = (user as any)?.onboardingStatus || 'not_started';

  const getSteps = (): OnboardingStep[] => {
    const steps: OnboardingStep[] = [
      {
        id: 'account_created',
        title: 'Account Created',
        description: 'Basic account information and agreements',
        status: 'completed',
      },
      {
        id: 'social_profile',
        title: 'Social Profile',
        description: 'Complete your profile for group participation',
        status: onboardingStatus === 'account_created' ? 'current' : 
               ['social_profile_completed', 'full_profile_completed', 'verified', 'premium_access', 'introduction_features'].includes(onboardingStatus) ? 'completed' : 'locked',
        route: '/onboarding/social-profile'
      },
      {
        id: 'full_profile',
        title: 'Complete Profile',
        description: 'Detailed profile for verification eligibility',
        status: onboardingStatus === 'social_profile_completed' ? 'current' :
               ['full_profile_completed', 'verified', 'premium_access', 'introduction_features'].includes(onboardingStatus) ? 'completed' : 'locked',
      },
      {
        id: 'verification',
        title: 'Video Verification',
        description: 'Verify your identity for safety',
        status: onboardingStatus === 'full_profile_completed' ? 'current' :
               ['verified', 'premium_access', 'introduction_features'].includes(onboardingStatus) ? 'completed' : 'locked',
      },
      {
        id: 'premium',
        title: 'Premium Access',
        description: 'Unlock advanced features and priority support',
        status: onboardingStatus === 'verified' ? 'current' :
               ['premium_access', 'introduction_features'].includes(onboardingStatus) ? 'completed' : 'locked',
      },
      {
        id: 'introductions',
        title: 'Introduction Features',
        description: 'Access to introduction and matching features',
        status: onboardingStatus === 'premium_access' ? 'current' :
               onboardingStatus === 'introduction_features' ? 'completed' : 'locked',
      },
    ];

    return steps;
  };

  const steps = getSteps();
  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const currentStep = steps.find(s => s.status === 'current');
  const progress = (completedSteps / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to Match Colab!</h1>
          <p className="text-secondary mb-6">Complete your onboarding to unlock all features</p>
          
          <div className="max-w-md mx-auto mb-4">
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-secondary mt-2">
              {completedSteps} of {steps.length} steps completed ({Math.round(progress)}%)
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:gap-6">
          {steps.map((step, index) => (
            <Card key={step.id} className={`relative ${
              step.status === 'current' ? 'ring-2 ring-primary' : ''
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {step.status === 'completed' ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : step.status === 'current' ? (
                      <Circle className="w-6 h-6 text-primary" />
                    ) : (
                      <Lock className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {step.title}
                      {step.status === 'completed' && (
                        <Badge variant="secondary" className="text-xs">
                          Complete
                        </Badge>
                      )}
                      {step.status === 'current' && (
                        <Badge variant="default" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {step.description}
                    </CardDescription>
                  </div>
                  {step.status === 'current' && step.route && (
                    <Button 
                      onClick={() => window.location.href = step.route}
                      className="flex items-center gap-2"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              {step.status === 'current' && (
                <CardContent className="pt-0">
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      This is your next step. Complete this to continue your onboarding journey.
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {currentStep && (
          <div className="mt-8 text-center">
            <Button 
              onClick={() => currentStep.route && (window.location.href = currentStep.route)}
              size="lg"
              className="px-8"
              disabled={!currentStep.route}
            >
              Continue with {currentStep.title}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        )}

        {onboardingStatus === 'introduction_features' && (
          <div className="mt-8 text-center">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-green-600">🎉 Onboarding Complete!</CardTitle>
                <CardDescription>
                  You've unlocked all features. Welcome to the community!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="w-full"
                >
                  Enter Match Colab
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}