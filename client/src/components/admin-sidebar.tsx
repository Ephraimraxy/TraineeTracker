import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Building, 
  Users, 
  BookOpen, 
  Settings, 
  Mail, 
  PieChart 
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'sponsors', label: 'Sponsors', icon: Building },
  { id: 'trainees', label: 'Trainees', icon: Users },
  { id: 'content', label: 'Content', icon: BookOpen },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'messages', label: 'Messages', icon: Mail },
  { id: 'reports', label: 'Reports', icon: PieChart },
];

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  return (
    <aside className="w-64 bg-white shadow-sm h-screen sticky top-0">
      <nav className="p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start space-x-3 h-12",
                    activeSection === item.id 
                      ? "bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary-dark))]" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => onSectionChange(item.id)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
