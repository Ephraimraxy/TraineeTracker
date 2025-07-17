import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sprout, Video, ClipboardCheck, TrendingUp, Users, BookOpen, Award } from "lucide-react";
import RegistrationModal from "@/components/registration-modal";
import LoginModal from "@/components/login-modal";

export default function Landing() {
  const [, navigate] = useLocation();
  const [showRegistration, setShowRegistration] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const { data: registrationEnabled } = useQuery({
    queryKey: ["/api/settings/registration_enabled"],
    retry: false,
  });

  const { data: activeSponsor } = useQuery({
    queryKey: ["/api/sponsors/active"],
    retry: false,
  });

  const isRegistrationEnabled = registrationEnabled?.value === "true";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="gradient-bg text-white py-6 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sprout className="h-8 w-8 text-[hsl(var(--secondary))]" />
            <div>
              <h1 className="text-2xl font-bold">CSS FARMS Nigeria</h1>
              <p className="text-sm opacity-90">Trainees Management System</p>
            </div>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="hover:text-[hsl(var(--secondary))] transition-colors">About</a>
            <a href="#" className="hover:text-[hsl(var(--secondary))] transition-colors">Programs</a>
            <a href="#" className="hover:text-[hsl(var(--secondary))] transition-colors">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="gradient-bg text-white py-20 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to the Future of Agricultural Training
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            Join thousands of trainees in our comprehensive agricultural development program
          </p>
          
          {/* Main Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => setShowRegistration(true)}
              disabled={!isRegistrationEnabled}
              className="bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary-dark))] text-white px-8 py-6 text-lg font-semibold card-shadow hover:card-shadow-hover transition-all"
            >
              <Users className="mr-2 h-5 w-5" />
              {isRegistrationEnabled ? "Register Now" : "Registration Closed"}
            </Button>
            <Button
              onClick={() => setShowLogin(true)}
              variant="outline"
              className="bg-white text-[hsl(var(--primary))] hover:bg-gray-100 border-white px-8 py-6 text-lg font-semibold card-shadow hover:card-shadow-hover transition-all"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Login
            </Button>
          </div>

          {/* Admin Login Link */}
          <div className="mt-6">
            <Button
              onClick={() => navigate("/admin-login")}
              variant="link"
              className="text-white hover:text-[hsl(var(--secondary))] underline text-sm"
            >
              Admin Login
            </Button>
          </div>
          
          {/* Registration Status */}
          <div className="mt-6 p-4 bg-white bg-opacity-10 rounded-lg inline-block">
            <Badge variant={isRegistrationEnabled ? "default" : "secondary"} className="text-sm">
              {isRegistrationEnabled
                ? "Registration is currently open for new trainees"
                : "No active registration available"}
            </Badge>
            {activeSponsor && (
              <p className="text-sm mt-2 opacity-90">
                Current sponsor: {activeSponsor.name}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-16 text-gray-800">
            Program Features
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 card-shadow hover:card-shadow-hover transition-all">
              <CardContent className="pt-6">
                <Video className="h-12 w-12 text-[hsl(var(--primary))] mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-3">Training Videos</h4>
                <p className="text-gray-600">
                  Access comprehensive video training modules designed by industry experts
                </p>
              </CardContent>
            </Card>
            <Card className="text-center p-6 card-shadow hover:card-shadow-hover transition-all">
              <CardContent className="pt-6">
                <ClipboardCheck className="h-12 w-12 text-[hsl(var(--primary))] mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-3">Assignments & Quizzes</h4>
                <p className="text-gray-600">
                  Complete assignments and take quizzes to test your knowledge and skills
                </p>
              </CardContent>
            </Card>
            <Card className="text-center p-6 card-shadow hover:card-shadow-hover transition-all">
              <CardContent className="pt-6">
                <TrendingUp className="h-12 w-12 text-[hsl(var(--primary))] mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-3">Progress Tracking</h4>
                <p className="text-gray-600">
                  Monitor your progress and achievements throughout the program
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6 text-gray-800">
                Why Choose CSS FARMS Nigeria?
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Award className="h-6 w-6 text-[hsl(var(--primary))] mt-1" />
                  <div>
                    <h4 className="font-semibold">Expert-Led Training</h4>
                    <p className="text-gray-600">Learn from industry professionals with years of experience</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-6 w-6 text-[hsl(var(--primary))] mt-1" />
                  <div>
                    <h4 className="font-semibold">Nationwide Program</h4>
                    <p className="text-gray-600">Join trainees from across Nigeria in this comprehensive program</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <BookOpen className="h-6 w-6 text-[hsl(var(--primary))] mt-1" />
                  <div>
                    <h4 className="font-semibold">Comprehensive Curriculum</h4>
                    <p className="text-gray-600">From basic agriculture to advanced farming techniques</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-dark))] p-8 rounded-lg text-white">
              <h4 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h4>
              <p className="mb-6">
                Join thousands of successful trainees who have transformed their agricultural knowledge through our program.
              </p>
              <Button
                onClick={() => setShowRegistration(true)}
                disabled={!isRegistrationEnabled}
                className="bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary-dark))] text-white"
              >
                Get Started Today
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <RegistrationModal
        isOpen={showRegistration}
        onClose={() => setShowRegistration(false)}
      />
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
      />
    </div>
  );
}
