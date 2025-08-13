import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { fullProfileSchema, type FullProfileInput } from "@shared/schema";
import { Save, X, Upload, Camera } from "lucide-react";

interface FullProfileEditorProps {
  user: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function FullProfileEditor({ user, onSuccess, onCancel }: FullProfileEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FullProfileInput>({
    resolver: zodResolver(fullProfileSchema),
    defaultValues: {
      middleName: user?.middleName || "",
      height: user?.height || "",
      hasChildren: user?.hasChildren || false,
      faith: user?.faith || "",
      country: user?.country || "",
      state: user?.state || "",
      nationality: user?.nationality || "",
      smoking: user?.smoking || "",
      drinking: user?.drinking || "",
      diet: user?.diet || "",
      workout: user?.workout || "",
      interests: user?.interests || "",
      languages: user?.languages || "",
      education: user?.education || "",
      degree: user?.degree || "",
      institution: user?.institution || "",
      professionalIntro: user?.professionalIntro || "",
      industry: user?.industry || "",
      currency: user?.currency || "",
      incomeRange: user?.incomeRange || "",
      idDocumentType: user?.idDocumentType || "",
      idDocumentNumber: user?.idDocumentNumber || "",
      preferredAgeMin: user?.preferredAgeMin || "",
      preferredAgeMax: user?.preferredAgeMax || "",
      preferredHeightMin: user?.preferredHeightMin || "",
      preferredHeightMax: user?.preferredHeightMax || "",
      preferredSmoking: user?.preferredSmoking || "",
      preferredDrinking: user?.preferredDrinking || "",
      preferredFaith: user?.preferredFaith || "",
      preferredMaritalStatus: user?.preferredMaritalStatus || "",
      willingToRelocate: user?.willingToRelocate || false,
      acceptSingleParent: user?.acceptSingleParent || false,
      additionalPreferences: user?.additionalPreferences || "",
      bio: user?.bio || "",
      familyDetails: user?.familyDetails || "",
      healthConcerns: user?.healthConcerns || "",
      photoUrls: user?.photoUrls || "",
      profileVisibility: user?.profileVisibility || "public",
      publicProfileFields: user?.publicProfileFields || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: FullProfileInput) => {
      return await apiRequest('POST', '/api/profile/full-update', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile Updated",
        description: "Your full profile has been successfully updated.",
      });
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FullProfileInput) => {
    setIsSubmitting(true);
    updateProfileMutation.mutate(data);
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Complete Profile</span>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-1" />
              {isSubmitting ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Complete your detailed profile with photos, preferences, and personal information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Photo Upload Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Photos</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Camera className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <Button variant="outline" type="button">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photos (Up to 5)
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    PNG, JPG up to 10MB each
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="middleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Middle Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Middle name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (cm)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="170" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="faith"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faith/Religion</FormLabel>
                      <FormControl>
                        <Input placeholder="Your faith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hasChildren"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>I have children</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nationality</FormLabel>
                      <FormControl>
                        <Input placeholder="Your nationality" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Your country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input placeholder="Your state" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Lifestyle */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Lifestyle & Habits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="smoking"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Smoking</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select smoking habit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="never">Never</SelectItem>
                          <SelectItem value="occasionally">Occasionally</SelectItem>
                          <SelectItem value="regularly">Regularly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="drinking"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Drinking</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select drinking habit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="never">Never</SelectItem>
                          <SelectItem value="socially">Socially</SelectItem>
                          <SelectItem value="regularly">Regularly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="diet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diet</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select diet type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="vegetarian">Vegetarian</SelectItem>
                          <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                          <SelectItem value="vegan">Vegan</SelectItem>
                          <SelectItem value="pescatarian">Pescatarian</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="workout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workout Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select workout frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="never">Never</SelectItem>
                          <SelectItem value="occasionally">Occasionally</SelectItem>
                          <SelectItem value="regularly">Regularly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="interests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interests & Hobbies</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your interests, hobbies, and passions..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="languages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Languages</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Languages you speak (e.g., English, Spanish, French)"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Professional Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Professional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select education level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high-school">High School</SelectItem>
                          <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                          <SelectItem value="masters">Master's Degree</SelectItem>
                          <SelectItem value="doctorate">Doctorate</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="degree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Degree/Field</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Computer Science, Business" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="institution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Institution</FormLabel>
                      <FormControl>
                        <Input placeholder="University/School name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Technology, Healthcare" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="professionalIntro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Introduction</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your career, achievements, and professional goals..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="INR">INR</SelectItem>
                          <SelectItem value="CAD">CAD</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="incomeRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Income Range (Annual)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select income range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="under-25k">Under 25k</SelectItem>
                          <SelectItem value="25k-50k">25k - 50k</SelectItem>
                          <SelectItem value="50k-75k">50k - 75k</SelectItem>
                          <SelectItem value="75k-100k">75k - 100k</SelectItem>
                          <SelectItem value="100k-150k">100k - 150k</SelectItem>
                          <SelectItem value="150k+">150k+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Partner Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Partner Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="preferredAgeMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Age (Min)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="18" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="preferredAgeMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Age (Max)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="65" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="preferredHeightMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Height Min (cm)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="150" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="preferredHeightMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Height Max (cm)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="200" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="preferredSmoking"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Smoking</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select preference" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="never">Never</SelectItem>
                          <SelectItem value="occasionally">Occasionally</SelectItem>
                          <SelectItem value="no-preference">No Preference</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="preferredDrinking"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Drinking</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select preference" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="never">Never</SelectItem>
                          <SelectItem value="socially">Socially</SelectItem>
                          <SelectItem value="no-preference">No Preference</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="willingToRelocate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Willing to relocate</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="acceptSingleParent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Open to single parents</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="additionalPreferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Preferences</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any other preferences or requirements for your ideal partner..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* About Me & Health */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">About Me & Health</h3>
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell your story... What makes you unique? What are you looking for?"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="familyDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Family Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your family background..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="healthConcerns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Health Information (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any health information you'd like to share..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Privacy Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Privacy Settings</h3>
              <FormField
                control={form.control}
                name="profileVisibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Visibility</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="contacts-only">Contacts Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}