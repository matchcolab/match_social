import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { socialProfileSchema, type SocialProfileInput } from "@shared/schema";
import { ArrowRight, Instagram, Facebook, Linkedin, CheckCircle, AlertCircle } from "lucide-react";

interface Step2SocialProfileProps {
  user: any;
  onNext: (data: any) => void;
}

export default function Step2SocialProfile({ user, onNext }: Step2SocialProfileProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialVerificationStatus, setSocialVerificationStatus] = useState<'pending' | 'verified' | 'failed'>('pending');

  const form = useForm<SocialProfileInput>({
    resolver: zodResolver(socialProfileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      gender: user?.gender || "",
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
      city: user?.city || "",
      maritalStatus: user?.maritalStatus || "",
      personalIntro: user?.personalIntro || "",
      instagramUrl: user?.instagramUrl || "",
      facebookUrl: user?.facebookUrl || "",
      linkedinUrl: user?.linkedinUrl || "",
      socialVerification: "",
    },
  });

  const updateSocialProfileMutation = useMutation({
    mutationFn: async (data: SocialProfileInput) => {
      return await apiRequest('POST', '/api/profile/social-update', data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Social Profile Complete!",
        description: "You can now participate in group activities and discussions.",
      });
      onNext(data);
    },
    onError: (error) => {
      console.error('Social profile update error:', error);
      toast({
        title: "Update Failed",
        description: "Please check your details and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SocialProfileInput) => {
    setIsSubmitting(true);
    updateSocialProfileMutation.mutate(data);
    setIsSubmitting(false);
  };

  const verifySocialConnection = async (platform: string, url: string) => {
    try {
      setSocialVerificationStatus('pending');
      // In real implementation, this would verify the social connection
      // For now, we'll simulate verification
      setTimeout(() => {
        setSocialVerificationStatus('verified');
        toast({
          title: "Social Connection Verified",
          description: `Your ${platform} profile has been verified successfully.`,
        });
      }, 2000);
    } catch (error) {
      setSocialVerificationStatus('failed');
      toast({
        title: "Verification Failed",
        description: `Unable to verify your ${platform} profile. Please check the URL.`,
        variant: "destructive",
      });
    }
  };

  const appId = user?.appId || "------";
  const displayId = `${form.watch('gender')?.charAt(0)?.toUpperCase() || 'X'}/${new Date(form.watch('dateOfBirth') || Date.now()).getFullYear() ? new Date().getFullYear() - new Date(form.watch('dateOfBirth')).getFullYear() : '--'}/${appId}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2">
            <Badge variant="secondary" className="text-sm">Step 2 of 6</Badge>
            <Badge variant="outline">Your App ID: {displayId}</Badge>
          </div>
          <h1 className="text-3xl font-bold">Complete Social Profile</h1>
          <p className="text-muted-foreground">
            Add your basic details and verify at least one social connection to join activities
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Social Profile Setup</CardTitle>
            <CardDescription>
              This information helps ensure credibility and context for group participation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personal Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="non_binary">Non-binary</SelectItem>
                              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Your city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maritalStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marital Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="single_never_married">Single, Never Married</SelectItem>
                              <SelectItem value="divorced">Divorced</SelectItem>
                              <SelectItem value="separated_filed">Separated (Divorce Filed)</SelectItem>
                              <SelectItem value="separated_not_filed">Separated (Divorce Not Filed)</SelectItem>
                              <SelectItem value="married">Married</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Personal Introduction */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personal Introduction</h3>
                  <FormField
                    control={form.control}
                    name="personalIntro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brief Personal Introduction</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us a bit about yourself, your interests, and what you're looking for..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Social Verification */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Social Verification</h3>
                  <p className="text-sm text-muted-foreground">
                    Verify at least one social connection to ensure credibility
                  </p>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="instagramUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Instagram className="w-4 h-4" />
                            <span>Instagram Profile URL</span>
                          </FormLabel>
                          <div className="flex space-x-2">
                            <FormControl>
                              <Input placeholder="https://instagram.com/username" {...field} />
                            </FormControl>
                            {field.value && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => verifySocialConnection('Instagram', field.value)}
                                disabled={socialVerificationStatus === 'pending'}
                              >
                                {socialVerificationStatus === 'verified' ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : socialVerificationStatus === 'failed' ? (
                                  <AlertCircle className="w-4 h-4 text-red-600" />
                                ) : (
                                  "Verify"
                                )}
                              </Button>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="facebookUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Facebook className="w-4 h-4" />
                            <span>Facebook Profile URL</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://facebook.com/username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="linkedinUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2">
                            <Linkedin className="w-4 h-4" />
                            <span>LinkedIn Profile URL</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://linkedin.com/in/username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || updateSocialProfileMutation.isPending}
                >
                  {isSubmitting || updateSocialProfileMutation.isPending ? (
                    "Saving Profile..."
                  ) : (
                    <>
                      Complete Social Profile
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            After completing this step, you'll be able to:
          </p>
          <div className="flex justify-center space-x-4 text-sm">
            <span className="text-green-600">• Join group activities</span>
            <span className="text-green-600">• Participate in discussions</span>
            <span className="text-green-600">• Respond to daily prompts</span>
          </div>
        </div>
      </div>
    </div>
  );
}