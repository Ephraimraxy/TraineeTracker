import { useState } from "react";
import { useLocation } from "wouter";
import RegistrationModal from "@/components/registration-modal";

export default function Register() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <RegistrationModal
        isOpen={true}
        onClose={() => setLocation("/")}
      />
    </div>
  );
}
