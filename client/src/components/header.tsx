import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { useLocation } from "wouter";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, LogOut, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface HeaderProps {
  variant?: 'admin' | 'trainee';
}

export default function Header({ variant }: HeaderProps) {
  const { user } = useAuth();
  const role: 'admin' | 'trainee' = variant ?? 'trainee';
  const [, setLocation] = useLocation();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmLogout = () => {
    setShowConfirm(false);
    setLocation("/");
    signOut(auth).catch(() => {});
  };

  const handleCancel = () => setShowConfirm(false);

  const getUserInitials = () => {
    if (user?.displayName) {
      const parts = user.displayName.split(' ');
      return parts.map((p) => p[0]).join('').toUpperCase();
    }
    return user?.email ? user.email[0].toUpperCase() : 'U';
  };

  const getUserName = () => {
    if (role === 'admin') return 'Administrator';
    return user?.displayName || user?.email || 'User';
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="https://cssfarms.ng/wp-content/uploads/2024/12/scrnli_QWDQo0eIg5qH8M.png" alt="CSS FARMS Logo" className="h-8 w-auto" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">CSS FARMS Nigeria</h1>
                <p className="text-sm text-gray-600">
                  {role === 'admin' ? 'Admin Panel' : 'Trainee Dashboard'}
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
                    {role === 'admin' ? 'Administrator' : 'Trainee'}
                  </Badge>
                </div>
              </div>
              {/* Show logout for trainees; admins log out via sidebar */}
              {role !== 'admin' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogoutClick}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-sm animate-in zoom-in-95 fade-in-50">
          <DialogHeader>
            <DialogTitle className="text-center">
              <img src="https://cssfarms.ng/wp-content/uploads/2024/12/scrnli_QWDQo0eIg5qH8M.png" alt="Logo" className="h-12 w-auto mx-auto mb-4 animate-bounce" />
              Are you sure you want to logout?
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmLogout}>Logout</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}