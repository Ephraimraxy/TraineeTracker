import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Sprout, LogOut, User } from "lucide-react";

export default function Header() {
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getUserInitials = () => {
    if (user?.trainee) {
      return `${user.trainee.firstName[0]}${user.trainee.lastName[0]}`;
    }
    return user?.firstName ? `${user.firstName[0]}${user.lastName?.[0] || ''}` : 'U';
  };

  const getUserName = () => {
    if (user?.trainee) {
      return `${user.trainee.firstName} ${user.trainee.lastName}`;
    }
    return user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'User';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Sprout className="h-8 w-8 text-[hsl(var(--primary))]" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">CSS FARMS Nigeria</h1>
              <p className="text-sm text-gray-600">
                {user?.role === 'admin' ? 'Admin Dashboard' : 'Trainee Dashboard'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="p-2 text-gray-500 hover:text-gray-700">
              <Bell className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[hsl(var(--primary))] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {getUserInitials()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">{getUserName()}</span>
                <Badge variant="outline" className="text-xs">
                  {user?.role === 'admin' ? 'Administrator' : 'Trainee'}
                </Badge>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
