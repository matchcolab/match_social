import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { socialProfileSchema, type SocialProfileInput } from "@shared/schema";
import { Users, Instagram, Facebook, Linkedin, ArrowRight, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

export default function SocialProfile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<SocialProfileInput>({
    resolver: zodResolver(socialProfileSchema),
    defaultValues: {
      firstName: (user as any)?.firstName || "",
      lastName: (user as any)?.lastName || "",
      gender: undefined,
      dateOfBirth: undefined,
      city: "",
      maritalStatus: undefined,
      personalIntro: "",
      instagramUrl: "",
      facebookUrl: "",
      linkedinUrl: "",
      socialVerification: "",
    },
  });

  const socialProfileMutation = useMutation({
    mutationFn: async (data: SocialProfileInput) => {
      const response = await apiRequest('/api/onboarding/social-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Social Profile Complete!",
        description: "You can now participate in group activities",
      });
      window.location.reload(); // This will trigger the onboarding flow redirect
    },
    onError: (error) => {
      console.error('Social profile error:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SocialProfileInput) => {
    // Determine which social platform was provided for verification
    if (data.instagramUrl) {
      data.socialVerification = 'instagram';
    } else if (data.facebookUrl) {
      data.socialVerification = 'facebook';
    } else if (data.linkedinUrl) {
      data.socialVerification = 'linkedin';
    }

    socialProfileMutation.mutate(data);
  };

  // Check if at least one social URL is provided
  const watchInstagram = form.watch("instagramUrl");
  const watchFacebook = form.watch("facebookUrl");
  const watchLinkedin = form.watch("linkedinUrl");
  const hasSocialVerification = watchInstagram || watchFacebook || watchLinkedin;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4">
            <Users className="mr-2 h-4 w-4" />
            Step 2 of 6
          </Badge>
          <h1 className="text-3xl font-bold mb-2">Create Your Social Profile</h1>
          <p className="text-muted-foreground text-lg">
            This information helps the community get to know you and enables participation in group activities.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Tell us about yourself so you can join community discussions and activities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input {...field} />
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
                          <Input 
                            type="date" 
                            {...field}
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          />
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
                          <Input placeholder="New York" {...field} />
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
                            <SelectItem value="single_never_married">Single, never married</SelectItem>
                            <SelectItem value="divorced">Divorced</SelectItem>
                            <SelectItem value="separated_filed">Separated (divorce filed)</SelectItem>
                            <SelectItem value="separated_not_filed">Separated (divorce not filed)</SelectItem>
                            <SelectItem value="married">Married</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="personalIntro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personal Introduction</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us a bit about yourself - your interests, what you're looking for in this community..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-2">Social Verification</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Connect at least one social profile to verify your identity and build trust within the community.
                    </p>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="instagramUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2">
                              <Instagram className="h-4 w-4" />
                              <span>Instagram Profile</span>
                              {watchInstagram && <CheckCircle className="h-4 w-4 text-green-500" />}
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="https://instagram.com/username" {...field} />
                            </FormControl>
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
                              <Facebook className="h-4 w-4" />
                              <span>Facebook Profile</span>
                              {watchFacebook && <CheckCircle className="h-4 w-4 text-green-500" />}
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
                              <Linkedin className="h-4 w-4" />
                              <span>LinkedIn Profile</span>
                              {watchLinkedin && <CheckCircle className="h-4 w-4 text-green-500" />}
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="https://linkedin.com/in/username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {!hasSocialVerification && (
                      <p className="text-sm text-destructive mt-2">
                        Please provide at least one social media profile for verification.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setLocation('/onboarding/progress')}
                  >
                    Skip for Now
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={socialProfileMutation.isPending || !hasSocialVerification}
                  >
                    {socialProfileMutation.isPending ? "Saving..." : "Complete Profile"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}