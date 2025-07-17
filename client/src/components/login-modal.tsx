import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, LogIn, Shield } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const handleLogin = () => {
    // Redirect to Replit Auth
    window.location.href = "/api/login";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Login</DialogTitle>
          <p className="text-center text-gray-600">Welcome back to CSS FARMS Nigeria</p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                id="email"
                type="email" 
                className="pl-9" 
                placeholder="Enter your email"
                disabled
              />
            </div>
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                id="password"
                type="password" 
                className="pl-9" 
                placeholder="Enter password"
                disabled
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" disabled />
              <Label htmlFor="remember" className="text-sm text-gray-600">
                Remember me
              </Label>
            </div>
            <a href="#" className="text-sm text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-dark))]">
              Forgot password?
            </a>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleLogin}
              className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-dark))] text-white"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Login with CSS FARMS
            </Button>
            
            <div className="text-center text-sm text-gray-600">
              <p>This system uses secure authentication</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
