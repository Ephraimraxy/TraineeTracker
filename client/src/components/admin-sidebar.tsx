
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Users, 
  Building, 
  BookOpen, 
  Bell, 
  Settings, 
  LogOut,
  Upload,
  MessageSquare,
  FileText,
  Calendar,
  Shield
} from "lucide-react";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const sidebarItems = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: BarChart3, 
      description: "System overview and stats"
    },
    { 
      id: "sponsors", 
      label: "Sponsors", 
      icon: Building, 
      description: "Manage training sponsors"
    },
    { 
      id: "trainees", 
      label: "Trainees", 
      icon: Users, 
      description: "View and manage trainees"
    },
    { 
      id: "content", 
      label: "Content", 
      icon: BookOpen, 
      description: "Upload training materials"
    },
    { 
      id: "announcements", 
      label: "Announcements", 
      icon: Bell, 
      description: "Send messages to trainees"
    },
    { 
      id: "settings", 
      label: "Settings", 
      icon: Settings, 
      description: "System configuration"
    }
  ];

  const handleLogout = () => {
    window.location.href = "/api/admin/logout";
  };

  return (
    <div className="w-64 bg-white shadow-lg h-screen">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1">
            <img src="https://cssfarms.ng/wp-content/uploads/2024/12/scrnli_QWDQo0eIg5qH8M.png" alt="CSS FARMS Logo" className="h-8 w-auto object-contain" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Admin Panel</h2>
            <p className="text-sm text-gray-600">CSS FARMS Nigeria</p>
          </div>
        </div>
      </div>

      <nav className="mt-6">
        <div className="px-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start text-left h-auto p-3",
                  activeSection === item.id
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
                onClick={() => onSectionChange(item.id)}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.label}</p>
                    <p className="text-xs opacity-75 truncate">{item.description}</p>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t bg-gray-50">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}
