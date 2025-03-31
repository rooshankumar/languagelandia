import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Check, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter, // Added CardFooter import
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Label } from "@/components/ui/label"; // Added import

interface OnboardingProps {
  onComplete: () => void;
}

type OnboardingFormData = {
  full_name: string;
  gender: string;
  date_of_birth?: Date;
  native_language: string;
  learning_language: string;
  proficiency_level: string;
  learning_goal: string;
  avatar_url: string;
}

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<OnboardingFormData>({
    defaultValues: {
      full_name: "",
      gender: "",
      native_language: "",
      learning_language: "",
      proficiency_level: "",
      learning_goal: "",
      avatar_url: "",
      date_of_birth: undefined as Date | undefined,
    },
    async validate(values) {
      const errors: Record<string, string> = {};
      if (!values.name) errors.name = "Name is required";
      if (!values.gender) errors.gender = "Gender is required";
      //Date of birth is no longer required.
      return errors;
    }
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  const calculateAge = (dob: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDifference = today.getMonth() - dob.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  };

  const languages = [
    "English", "Spanish", "French", "German", "Italian",
    "Portuguese", "Chinese", "Japanese", "Korean", "Russian",
    "Arabic", "Hindi", "Turkish", "Dutch", "Swedish"
  ];

  const proficiencyLevels = [
    "Beginner (A1)", "Elementary (A2)", "Intermediate (B1)", 
    "Upper Intermediate (B2)", "Advanced (C1)", "Proficient (C2)"
  ];

  const isStepValid = (step: number) => {
    const values = form.getValues();
    switch (step) {
      case 1:
        return !!values.name && !!values.gender; //Removed dob validation
      case 2:
        return !!values.nativeLanguage && !!values.learningLanguage && !!values.proficiencyLevel;
      case 3:
        if (!values.learningGoal) return false;
        return (async () => {
          const age = values.dob ? calculateAge(values.dob) : null;
          const { data: sessionData } = await supabase.auth.getSession();
          const currentUserId = sessionData?.session?.user?.id;

          if (!currentUserId) {
            console.error('No user ID found in session');
            return false;
          }

          const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('id', currentUserId)
            .single();

          if (checkError) {
            const { error: insertError } = await supabase
              .from('users')
              .insert([{
                id: currentUserId,
                full_name: values.name,
                gender: values.gender,
                date_of_birth: values.dob?.toISOString(),
                native_language: values.nativeLanguage,
                learning_language: values.learningLanguage,
                proficiency_level: values.proficiencyLevel,
                learning_goal: values.learningGoal,
                avatar_url: values.avatarUrl,
                updated_at: new Date().toISOString(),
                onboarding_status: false //Added onboarding status
              }]);

            if (insertError) {
              console.error('Error creating user profile:', insertError);
              return false;
            }
          } else {
            const { error: updateError } = await supabase
              .from('users')
              .update(userData)
              .eq('id', user.id);

            if (updateError) {
              console.error('Error updating user profile:', updateError);
              return false;
            }
          }

          const { error: onboardingError } = await supabase
            .from('onboarding_status')
            .upsert({
              user_id: currentUserId,
              is_complete: true,
              current_step: 'completed',
              updated_at: new Date().toISOString()
            });

          if (onboardingError) {
            console.error("Error updating onboarding status:", onboardingError);
            toast({
              variant: "destructive",
              title: "Error updating onboarding status",
              description: "Please try again.",
            });
            return false;
          }
          return true;
        })();
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (isStepValid(step)) {
      if (step < 4) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    } else {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields.",
      });
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const formData = form.getValues();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        toast({
          variant: "destructive",
          title: "Authentication error",
          description: "You must be logged in to complete onboarding.",
        });
        navigate("/auth");
        return;
      }

      // Format the data properly
      const profileData = {
        gender: formData.gender,
        date_of_birth: formData.date_of_birth instanceof Date ? 
          formData.date_of_birth.toISOString().split('T')[0] : 
          null,
        native_language: formData.native_language,
        learning_language: formData.learning_language,
        proficiency_level: formData.proficiency_level,
        learning_goal: formData.learning_goal,
        avatar_url: formData.avatar_url,
        full_name: formData.full_name,
        updated_at: new Date().toISOString()
      };

      console.log("Submitting onboarding data:", profileData);

      // Update profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Error updating profile data:', profileError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update profile. Please try again.",
        });
        return;
      }

      // Update onboarding status in users table
      const { error: onboardingError } = await supabase
        .from('users')
        .update({
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (onboardingError) {
        console.error('Error updating onboarding status:', onboardingError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update onboarding status. Please try again.",
        });
        return;
      }


      // Show success message
      toast({
        title: "Profile created",
        description: "Your profile has been successfully set up!",
      });


      // Update local storage for immediate effect
      localStorage.setItem("onboarding_completed", "true");

      // Call onComplete prop
      onComplete();

      // Force reload to trigger ProtectedRoute check
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Onboarding error:", error);
      toast({
        variant: "destructive",
        title: "Error completing onboarding",
        description: "There was an error setting up your profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      setIsLoading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      form.setValue("avatarUrl", publicUrl);

      toast({
        title: "Avatar uploaded",
        description: "Your profile picture has been updated.",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Could not upload profile picture. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };


  let user;
  let userId = null;
  (async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userData) {
      user = userData.user;
      userId = user.id;
    }
  })();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-secondary">
      <div className="w-full max-w-md">
        <Card className="shadow-lg animate-fade-in">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Complete Your Profile</CardTitle>
                <CardDescription>
                  Step {step} of 4
                </CardDescription>
              </div>
              <div className="flex">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={cn(
                      "w-2.5 h-2.5 rounded-full mx-1",
                      s === step ? "bg-primary" : s < step ? "bg-primary/50" : "bg-muted"
                    )}
                  />
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <FormField
                      control={form.control}
                      name="dob"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              className="col-span-3"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="avatar">Profile Picture</Label>
                    <Input
                      type="file"
                      id="avatar"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          uploadAvatar(file);
                        }
                      }}
                      className="col-span-3"
                    />
                    {form.getValues("avatarUrl") && (
                      <div className="mt-2">
                        <img 
                          src={form.getValues("avatarUrl")} 
                          alt="Profile preview" 
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your full name"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="nativeLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Native Language</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your native language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {languages.map((language) => (
                              <SelectItem key={language} value={language}>
                                {language}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="learningLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language You Want to Learn</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a language to learn" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {languages
                              .filter((lang) => lang !== form.getValues("nativeLanguage"))
                              .map((language) => (
                                <SelectItem key={language} value={language}>
                                  {language}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="proficiencyLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proficiency Level</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your proficiency level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {proficiencyLevels.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select your current level of proficiency in your target language.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="learningGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Learning Goal</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What do you want to achieve with this language? (e.g., travel, work, cultural interest)"
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This helps us match you with suitable language partners.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-border">
                        {form.getValues("avatarUrl") ? (
                          <img 
                            src={form.getValues("avatarUrl")} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-semibold text-muted-foreground">
                            {form.getValues("name")?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        )}
                      </div>
                      <Button 
                        size="icon" 
                        className="absolute bottom-0 right-0 rounded-full"
                        onClick={uploadAvatar}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Upload a profile picture (optional)
                      </p>
                      <Button 
                        variant="outline" 
                        className="button-hover"
                        onClick={uploadAvatar}
                      >
                        Upload Avatar
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <h3 className="font-medium">Review Your Information</h3>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Name</p>
                        <p className="font-medium">{form.getValues("name")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Gender</p>
                        <p className="font-medium">{form.getValues("gender")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date of Birth</p>
                        <p className="font-medium">
                          {form.getValues("dob") ? format(form.getValues("dob")!, "PPP") : "Not set"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Native Language</p>
                        <p className="font-medium">{form.getValues("nativeLanguage")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Learning</p>
                        <p className="font-medium">{form.getValues("learningLanguage")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Level</p>
                        <p className="font-medium">{form.getValues("proficiencyLevel")}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Learning Goal</p>
                      <p className="text-sm">{form.getValues("learningGoal")}</p>
                    </div>
                  </div>
                </div>
              )}
            </Form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevStep}
              disabled={step === 1}
              className="button-hover"
            >
              Back
            </Button>
            <Button 
              onClick={handleNextStep}
              className="button-hover"
            >
              {step < 4 ? "Next" : "Complete Profile"}
              {step === 4 && <Check className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;