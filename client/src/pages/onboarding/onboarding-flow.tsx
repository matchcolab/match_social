import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Step1Signup from "./step1-signup";
import Step2SocialProfile from "./step2-social-profile";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const ONBOARDING_STEPS = [
  { id: 1, title: "Create Account", status: "account_created", description: "Basic contact details and verification" },
  { id: 2, title: "Social Profile", status: "social_profile_complete", description: "Personal details and social verification" },
  { id: 3, title: "Complete Profile", status: "full_profile_complete", description: "Comprehensive background information" },
  { id: 4, title: "Verification", status: "verified", description: "Identity verification process" },
  { id: 5, title: "Subscription", status: "subscribed", description: "Premium access for introductions" },
  { id: 6, title: "Participation", status: "active_participant", description: "Start engaging in community" },
];

export default function OnboardingFlow() {
  const [, setLocation] = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState<any>(null);
  const { toast } = useToast();

  // Determine current step based on user's onboarding status
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const status = (user as any)?.onboardingStatus;
      switch (status) {
        case 'account_created':
          setCurrentStep(2);
          break;
        case 'social_profile_complete':
          setCurrentStep(3);
          // Redirect to full profile completion
          setLocation('/profile?tab=full-profile');
          break;
        case 'full_profile_complete':
          setCurrentStep(4);
          // Redirect to verification process
          setLocation('/verification');
          break;
        case 'verified':
          setCurrentStep(5);
          // Redirect to subscription
          setLocation('/subscription');
          break;
        case 'subscribed':
        case 'active_participant':
          // Onboarding complete, redirect to home
          setLocation('/');
          break;
        default:
          setCurrentStep(1);
      }
      setUserData(user);
    } else if (!isLoading && !isAuthenticated) {
      setCurrentStep(1);
    }
  }, [user, isLoading, isAuthenticated, setLocation]);

  const handleStep1Complete = (data: any) => {
    setUserData(data);
    setCurrentStep(2);
    toast({
      title: "Welcome to Match Colab!",
      description: `Your App ID is ${data.appId}. This is how you'll be identified in the community.`,
    });
  };

  const handleStep2Complete = (data: any) => {
    setUserData(data);
    toast({
      title: "Social Profile Complete!",
      description: "You can now participate in group activities. Complete your full profile next to unlock verification.",
    });
    // Redirect to profile completion
    setTimeout(() => {
      setLocation('/profile?tab=full-profile');
    }, 2000);
  };

  const getProgressPercentage = () => {
    return Math.round((currentStep / ONBOARDING_STEPS.length) * 100);
  };

  // Show loading while auth is loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      {/* Progress Header */}
      {currentStep > 1 && (
        <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b z-10 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  Step {currentStep} of {ONBOARDING_STEPS.length}
                </Badge>
                {userData?.appId && (
                  <Badge variant="outline">
                    App ID: {userData.appId}
                  </Badge>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {getProgressPercentage()}% Complete
              </span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="container mx-auto py-8">
        {currentStep === 1 && (
          <Step1Signup onNext={handleStep1Complete} />
        )}
        
        {currentStep === 2 && (
          <Step2SocialProfile 
            user={userData} 
            onNext={handleStep2Complete} 
          />
        )}

        {currentStep > 2 && (
          <div className="text-center space-y-4">
            <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4">
                {ONBOARDING_STEPS[currentStep - 1]?.title}
              </h2>
              <p className="text-muted-foreground mb-6">
                {ONBOARDING_STEPS[currentStep - 1]?.description}
              </p>
              <Badge variant="secondary">
                Redirecting...
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Steps Overview */}
      {currentStep <= 2 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
              {ONBOARDING_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-2 rounded text-center ${
                    index + 1 === currentStep
                      ? "bg-primary text-primary-foreground"
                      : index + 1 < currentStep
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <div className="font-medium">{step.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}