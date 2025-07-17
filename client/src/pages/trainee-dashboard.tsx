import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sprout, 
  Video, 
  ClipboardCheck, 
  Upload, 
  TrendingUp, 
  Bell,
  User,
  Bed,
  GraduationCap,
  Play,
  CheckCircle,
  FileText
} from "lucide-react";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";

export default function TraineeDashboard() {
  const { user } = useAuth();
  
  const { data: announcements } = useQuery({
    queryKey: ["/api/announcements"],
    enabled: !!user?.trainee?.sponsorId,
  });

  const { data: content } = useQuery({
    queryKey: ["/api/content"],
    enabled: !!user?.trainee?.sponsorId,
  });

  const { data: progress } = useQuery({
    queryKey: ["/api/progress", user?.trainee?.id],
    enabled: !!user?.trainee?.id,
  });

  if (!user?.trainee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600">No trainee profile found</p>
              <Button 
                onClick={() => window.location.href = "/api/logout"}
                className="mt-4"
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const trainee = user.trainee;
  const sponsor = user.sponsor;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Sponsor Information */}
          {sponsor && (
            <Card className="mb-6 card-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2">
                    <img src="/logo.png" alt="CSS FARMS Logo" className="h-full w-auto object-contain" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{sponsor.name}</h2>
                    <p className="text-gray-600">Your training sponsor</p>
                    {sponsor.description && (
                      <p className="text-sm text-gray-500 mt-1">{sponsor.description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Profile Card */}
            <Card className="card-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {trainee.firstName} {trainee.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">ID: {trainee.traineeId}</p>
                    <p className="text-sm text-gray-600">Tag: {trainee.tagNumber}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Room Info */}
            <Card className="card-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-[hsl(var(--secondary))] rounded-full flex items-center justify-center">
                    <Bed className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Room {trainee.roomNumber}</h3>
                    <p className="text-sm text-gray-600">Accommodation</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lecture Venue */}
            <Card className="card-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-[hsl(var(--accent))] rounded-full flex items-center justify-center">
                    <GraduationCap className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{trainee.lectureVenue}</h3>
                    <p className="text-sm text-gray-600">Lecture Venue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="card-shadow hover:card-shadow-hover transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <Play className="h-12 w-12 text-[hsl(var(--primary))] mx-auto mb-3" />
                <h4 className="font-semibold text-gray-800">Watch Videos</h4>
                <p className="text-sm text-gray-600 mt-2">Access training content</p>
              </CardContent>
            </Card>
            <Card className="card-shadow hover:card-shadow-hover transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <ClipboardCheck className="h-12 w-12 text-[hsl(var(--secondary))] mx-auto mb-3" />
                <h4 className="font-semibold text-gray-800">Take Quiz</h4>
                <p className="text-sm text-gray-600 mt-2">Test your knowledge</p>
              </CardContent>
            </Card>
            <Card className="card-shadow hover:card-shadow-hover transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <Upload className="h-12 w-12 text-[hsl(var(--success))] mx-auto mb-3" />
                <h4 className="font-semibold text-gray-800">Submit Work</h4>
                <p className="text-sm text-gray-600 mt-2">Upload assignments</p>
              </CardContent>
            </Card>
            <Card className="card-shadow hover:card-shadow-hover transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 text-[hsl(var(--info))] mx-auto mb-3" />
                <h4 className="font-semibold text-gray-800">View Progress</h4>
                <p className="text-sm text-gray-600 mt-2">Track achievements</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progress && progress.length > 0 ? (
                  progress.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-[hsl(var(--success))] rounded-full flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {item.status === 'completed' ? 'Completed' : 'In Progress'}: Content #{item.contentId}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.score ? `Score: ${item.score}%` : 'No score yet'} - {new Date(item.updatedAt!).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent activities</p>
                    <p className="text-sm text-gray-500 mt-2">Start watching videos or taking quizzes to see your progress here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
