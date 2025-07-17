import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Video, 
  ClipboardCheck, 
  Upload, 
  Megaphone, 
  TrendingUp, 
  Headphones 
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'videos', label: 'Training Videos', icon: Video },
  { id: 'quizzes', label: 'Quizzes & Tests', icon: ClipboardCheck },
  { id: 'assignments', label: 'Assignments', icon: Upload },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'support', label: 'Support', icon: Headphones },
];

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState('dashboard');

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
                    activeItem === item.id 
                      ? "bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary-dark))]" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => setActiveItem(item.id)}
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
