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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100">
      {/* Modern Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-green-600 p-2 rounded-xl">
                <img src="/logo.png" alt="CSS FARMS Logo" className="h-8 w-auto" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">CSS FARMS Nigeria</h1>
                <p className="text-sm text-gray-600">Agricultural Training Excellence</p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate("/admin-login")}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-green-600 hover:bg-green-50"
              >
                Admin Access
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Award className="mr-2 h-4 w-4" />
              Nigeria's Leading Agricultural Training Platform
            </div>

            <h2 className="text-5xl md:text-7xl font-bold text-gray-800 mb-8 leading-tight">
              Transform Your
              <span className="text-green-600 block">Agricultural Future</span>
            </h2>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join our comprehensive training program and become part of Nigeria's agricultural revolution
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Trainee Registration Card */}
            <Card className="p-8 bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Join as Trainee</h3>
                    <p className="text-gray-600">Start your agricultural journey</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-gray-600">
                    <Video className="h-4 w-4 mr-2 text-green-600" />
                    <span>Video-based learning modules</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <ClipboardCheck className="h-4 w-4 mr-2 text-green-600" />
                    <span>Practical assignments & assessments</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Award className="h-4 w-4 mr-2 text-green-600" />
                    <span>Industry-recognized certification</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => setShowRegistration(true)}
                    disabled={!isRegistrationEnabled}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                    size="lg"
                  >
                    {isRegistrationEnabled ? "Register Now" : "Registration Closed"}
                  </Button>

                  <Button
                    onClick={() => setShowLogin(true)}
                    variant="outline"
                    className="w-full border-green-600 text-green-600 hover:bg-green-50 py-3 text-lg"
                    size="lg"
                  >
                    Already Registered? Login
                  </Button>
                </div>

                {/* Registration Status */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <Badge variant={isRegistrationEnabled ? "default" : "secondary"} className="mb-2">
                    {isRegistrationEnabled
                      ? "✓ Registration Open"
                      : "⚠ Registration Closed"}
                  </Badge>
                  {activeSponsor && (
                    <p className="text-sm text-gray-600">
                      Current sponsor: <span className="font-semibold">{activeSponsor.name}</span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Program Information Card */}
            <Card className="p-8 bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Program Benefits</h3>
                    <p className="text-gray-600">What you'll gain from our training</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <BookOpen className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Expert-Led Training</h4>
                      <p className="text-sm text-gray-600">Learn from industry professionals with years of experience</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Award className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Certification</h4>
                      <p className="text-sm text-gray-600">Receive recognized certificates upon completion</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Community Network</h4>
                      <p className="text-sm text-gray-600">Connect with fellow trainees and mentors</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-6">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src="/logo.png" alt="CSS FARMS Logo" className="h-8 w-auto" />
            <span className="text-lg font-semibold">CSS FARMS Nigeria</span>
          </div>
          <p className="text-gray-400 text-sm">
            Transforming Nigeria's agricultural sector through comprehensive training programs
          </p>
        </div>
      </footer>

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