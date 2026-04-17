import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-destructive/10 p-4 rounded-full">
            <ShieldAlert className="h-16 w-16 text-destructive" />
          </div>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Access Denied</h1>
        <p className="text-lg text-muted-foreground">
          You do not have permission to access this profile. Please contact your administrator if you believe this is an error.
        </p>
        <div className="pt-4">
          <Button asChild size="lg" className="w-full">
            <Link to="/">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
