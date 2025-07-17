import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, Lock, User, Phone, Calendar, MapPin, Globe, Upload } from "lucide-react";

const step1Schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const step2Schema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

const step3Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),
  phoneNumber: z.string().min(10, "Phone number is required"),
  gender: z.enum(["male", "female", "other"]),
  dateOfBirth: z.string(),
  stateOfOrigin: z.string().min(1, "State of origin is required"),
  localGovernmentArea: z.string().min(1, "Local government area is required"),
  nationality: z.string().default("Nigerian"),
});

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegistrationModal({ isOpen, onClose }: RegistrationModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationData, setRegistrationData] = useState<any>({});
  const { toast } = useToast();

  const step1Form = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const step2Form = useForm<z.infer<typeof step2Schema>>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      code: "",
    },
  });

  const step3Form = useForm<z.infer<typeof step3Schema>>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      middleName: "",
      phoneNumber: "",
      gender: "male",
      dateOfBirth: "",
      stateOfOrigin: "",
      localGovernmentArea: "",
      nationality: "Nigerian",
    },
  });

  const step1Mutation = useMutation({
    mutationFn: async (data: z.infer<typeof step1Schema>) => {
      const response = await apiRequest("POST", "/api/register/step1", data);
      return response.json();
    },
    onSuccess: (data) => {
      setRegistrationData(prev => ({ ...prev, ...step1Form.getValues() }));
      setCurrentStep(2);
      toast({
        title: "Email sent",
        description: "Please check your email for the verification code.",
      });
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const step2Mutation = useMutation({
    mutationFn: async (data: z.infer<typeof step2Schema>) => {
      const response = await apiRequest("POST", "/api/register/verify", {
        email: registrationData.email,
        code: data.code,
      });
      return response.json();
    },
    onSuccess: () => {
      setCurrentStep(3);
      toast({
        title: "Email verified",
        description: "Please complete your profile.",
      });
    },
    onError: (error) => {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const step3Mutation = useMutation({
    mutationFn: async (data: z.infer<typeof step3Schema>) => {
      const response = await apiRequest("POST", "/api/register/complete", {
        email: registrationData.email,
        ...data,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Registration completed",
        description: "You can now log in to your account.",
      });
      onClose();
      setCurrentStep(1);
      step1Form.reset();
      step2Form.reset();
      step3Form.reset();
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStep1Submit = (data: z.infer<typeof step1Schema>) => {
    step1Mutation.mutate(data);
  };

  const handleStep2Submit = (data: z.infer<typeof step2Schema>) => {
    step2Mutation.mutate(data);
  };

  const handleStep3Submit = (data: z.infer<typeof step3Schema>) => {
    step3Mutation.mutate(data);
  };

  const handleClose = () => {
    onClose();
    setCurrentStep(1);
    step1Form.reset();
    step2Form.reset();
    step3Form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {currentStep === 1 && "Create Account"}
            {currentStep === 2 && "Verify Email"}
            {currentStep === 3 && "Complete Profile"}
          </DialogTitle>
          <p className="text-center text-gray-600">
            Step {currentStep} of 3
          </p>
        </DialogHeader>

        {/* Step 1: Email and Password */}
        {currentStep === 1 && (
          <Form {...step1Form}>
            <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-4">
              <FormField
                control={step1Form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input className="pl-9" placeholder="Enter your email" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={step1Form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input className="pl-9" type="password" placeholder="Create password" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={step1Form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input className="pl-9" type="password" placeholder="Confirm password" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-dark))]"
                disabled={step1Mutation.isPending}
              >
                {step1Mutation.isPending ? "Sending..." : "Continue"}
              </Button>
            </form>
          </Form>
        )}

        {/* Step 2: Email Verification */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="text-center">
              <Mail className="h-12 w-12 text-[hsl(var(--primary))] mx-auto mb-4" />
              <p className="text-gray-600">We've sent a verification code to your email</p>
            </div>
            <Form {...step2Form}>
              <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-4">
                <FormField
                  control={step2Form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <Input 
                          className="text-center text-2xl" 
                          placeholder="000000" 
                          maxLength={6}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-dark))]"
                  disabled={step2Mutation.isPending}
                >
                  {step2Mutation.isPending ? "Verifying..." : "Verify & Continue"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => step1Mutation.mutate({ email: registrationData.email, password: registrationData.password, confirmPassword: registrationData.password })}
                >
                  Resend Code
                </Button>
              </form>
            </Form>
          </div>
        )}

        {/* Step 3: Personal Information */}
        {currentStep === 3 && (
          <Form {...step3Form}>
            <form onSubmit={step3Form.handleSubmit(handleStep3Submit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={step3Form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={step3Form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={step3Form.control}
                name="middleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Middle name (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={step3Form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input className="pl-9" placeholder="+234 800 000 0000" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={step3Form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={step3Form.control}
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={step3Form.control}
                  name="stateOfOrigin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State of Origin</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="lagos">Lagos</SelectItem>
                          <SelectItem value="abuja">Abuja</SelectItem>
                          <SelectItem value="kano">Kano</SelectItem>
                          <SelectItem value="rivers">Rivers</SelectItem>
                          <SelectItem value="ogun">Ogun</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={step3Form.control}
                  name="localGovernmentArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LGA</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select LGA" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ikeja">Ikeja</SelectItem>
                          <SelectItem value="surulere">Surulere</SelectItem>
                          <SelectItem value="victoria-island">Victoria Island</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={step3Form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationality</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select nationality" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Nigerian">Nigerian</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <Label htmlFor="passport">Passport Photograph</Label>
                <Input 
                  id="passport"
                  type="file" 
                  accept="image/*" 
                  className="mt-1"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-dark))]"
                disabled={step3Mutation.isPending}
              >
                {step3Mutation.isPending ? "Completing..." : "Complete Registration"}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
