import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import AdminSidebar from "@/components/admin-sidebar";
import Header from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BarChart3, Users, Building, BookOpen, Bell, Settings, Plus, Edit, Trash2, Upload, FileText, Video, ClipboardCheck, GraduationCap, UserPlus, Filter, Download, Search } from "lucide-react";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const { data: registrationEnabled } = useQuery({
    queryKey: ["/api/settings/registration_enabled"],
    retry: false,
  });

  const { data: sponsors } = useQuery({
    queryKey: ["/api/sponsors"],
    retry: false,
  });

  const { data: activeSponsor } = useQuery({
    queryKey: ["/api/sponsors/active"],
    retry: false,
  });

  const { data: statistics } = useQuery({
    queryKey: ["/api/statistics"],
    retry: false,
  });

  const { data: trainees } = useQuery({
    queryKey: ["/api/trainees"],
    retry: false,
  });

  const registrationToggleMutation = useMutation({
    mutationFn: async (data: { enabled: boolean; sponsorId?: string }) => {
      // Update registration enabled status
      await apiRequest("POST", "/api/settings", {
        key: "registration_enabled",
        value: data.enabled.toString()
      });

      // If enabling registration and sponsor is selected, set as active sponsor
      if (data.enabled && data.sponsorId) {
        await apiRequest("PATCH", `/api/sponsors/${data.sponsorId}`, {
          isActive: true
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings/registration_enabled"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sponsors/active"] });
      toast({
        title: "Registration Updated",
        description: "Registration settings have been updated successfully.",
      });
      setShowRegistrationModal(false);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update registration settings.",
        variant: "destructive",
      });
    },
  });

  if (!user || user.role !== "admin") {
    navigate("/admin/login");
    return null;
  }

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const handleRegistrationToggle = () => {
    setShowRegistrationModal(true);
  };

  const handleRegistrationSubmit = (enabled: boolean, sponsorId?: string) => {
    registrationToggleMutation.mutate({ enabled, sponsorId });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex">
        <AdminSidebar 
        activeSection={activeSection} 
        onSectionChange={handleSectionChange}
        onRegistrationToggle={handleRegistrationToggle}
      />

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Dashboard Overview */}
          {activeSection === "dashboard" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard Overview</h2>
                <p className="text-gray-600">Welcome back, Administrator</p>
              </div>

              {/* Stats Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="card-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Trainees</p>
                        <p className="text-3xl font-bold text-[hsl(var(--primary))]">
                          {statistics?.totalTrainees || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-[hsl(var(--primary))] rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="card-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Sponsors</p>
                        <p className="text-3xl font-bold text-[hsl(var(--secondary))]">
                          {statistics?.activeSponsors || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-[hsl(var(--secondary))] rounded-full flex items-center justify-center">
                        <Building className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="card-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Completed Courses</p>
                        <p className="text-3xl font-bold text-[hsl(var(--success))]">
                          {statistics?.completedCourses || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-[hsl(var(--success))] rounded-full flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="card-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Content</p>
                        <p className="text-3xl font-bold text-[hsl(var(--info))]">
                          {statistics?.activeContent || 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-[hsl(var(--info))] rounded-full flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-800">Recent System Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-[hsl(var(--success))] rounded-full flex items-center justify-center">
                        <UserPlus className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">New trainees registered</p>
                        <p className="text-sm text-gray-600">Latest registrations - 2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-[hsl(var(--info))] rounded-full flex items-center justify-center">
                        <Video className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">New training video uploaded</p>
                        <p className="text-sm text-gray-600">Advanced Crop Management - 1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-[hsl(var(--secondary))] rounded-full flex items-center justify-center">
                        <Building className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">New sponsor added</p>
                        <p className="text-sm text-gray-600">Agricultural Development Program - 2 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Sponsors Section */}
          {activeSection === "sponsors" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Sponsors Management</h2>
                  <p className="text-gray-600">Manage training program sponsors</p>
                </div>
                <Button className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-dark))] text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Sponsor
                </Button>
              </div>

              {/* Sponsors Table */}
              <Card className="card-shadow overflow-hidden">
                <CardHeader className="border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-800">Active Sponsors</CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Filter className="mr-1 h-4 w-4" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-1 h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sponsor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trainees
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Start Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sponsors?.map((sponsor) => (
                          <tr key={sponsor.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 bg-[hsl(var(--primary))] rounded-full flex items-center justify-center">
                                    <Building className="h-5 w-5 text-white" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{sponsor.name}</div>
                                  <div className="text-sm text-gray-500">{sponsor.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {trainees?.filter(t => t.sponsorId === sponsor.id).length || 0}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={sponsor.isActive ? "default" : "secondary"}>
                                {sponsor.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {sponsor.startDate ? new Date(sponsor.startDate).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Button variant="ghost" size="sm" className="text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-dark))] mr-3">
                                Edit
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-900">
                                Deactivate
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Trainees Section */}
          {activeSection === "trainees" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Trainees Management</h2>
                  <p className="text-gray-600">View and manage trainee records</p>
                </div>
                <div className="flex space-x-3">
                  <select className="border border-gray-300 rounded-lg px-3 py-2">
                    <option value="">All Sponsors</option>
                    {sponsors?.map((sponsor) => (
                      <option key={sponsor.id} value={sponsor.id}>{sponsor.name}</option>
                    ))}
                  </select>
                  <Button className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-dark))] text-white">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Trainees Table */}
              <Card className="card-shadow overflow-hidden">
                <CardHeader className="border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-800">All Trainees</CardTitle>
                    <div className="flex space-x-2">
                      <input 
                        type="text" 
                        placeholder="Search trainees..." 
                        className="border border-gray-300 rounded-lg px-3 py-2"
                      />
                      <Button variant="outline" size="sm">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trainee
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tag Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sponsor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Room
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Venue
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {trainees?.map((trainee) => {
                          const sponsor = sponsors?.find(s => s.id === trainee.sponsorId);
                          return (
                            <tr key={trainee.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                                      <Users className="h-5 w-5 text-gray-600" />
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {trainee.firstName} {trainee.lastName}
                                    </div>
                                    <div className="text-sm text-gray-500">{trainee.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{trainee.tagNumber}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{sponsor?.name || "N/A"}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{trainee.roomNumber}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{trainee.lectureVenue}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant={trainee.isActive ? "default" : "secondary"}>
                                  {trainee.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <Button variant="ghost" size="sm" className="text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-dark))] mr-3">
                                  View
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-900">
                                  Deactivate
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Registration Toggle Modal */}
      <Dialog open={showRegistrationModal} onOpenChange={setShowRegistrationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Toggle Registration</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="registrationStatus">Registration Status</Label>
              <Select
                defaultValue={registrationEnabled?.value === 'true' ? 'enabled' : 'disabled'}
                onValueChange={(value) => {
                  const enabled = value === 'enabled';
                  if (enabled && !activeSponsor) {
                    // If enabling registration, prompt for sponsor selection
                    return;
                  }
                  handleRegistrationSubmit(enabled);
                }}
              >
                <SelectTrigger id="registrationStatus">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {registrationEnabled?.value === 'false' && (
              <div className="space-y-2">
                <Label htmlFor="sponsorSelect">Select Sponsor</Label>
                <Select onValueChange={(value) => handleRegistrationSubmit(true, value)}>
                  <SelectTrigger id="sponsorSelect">
                    <SelectValue placeholder="Select a Sponsor" />
                  </SelectTrigger>
                  <SelectContent>
                    {sponsors?.map((sponsor) => (
                      <SelectItem key={sponsor.id} value={sponsor.id}>
                        {sponsor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="secondary" onClick={() => setShowRegistrationModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowRegistrationModal(false)}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}