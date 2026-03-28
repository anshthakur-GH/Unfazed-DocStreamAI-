import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { departments } from "@/lib/departments"; // Import departments from the new utility file
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const navigate = useNavigate(); // Initialize navigate

  const handleDepartmentSelect = (departmentPath: string) => {
    const departmentName = departmentPath.split('/').pop();
    setSelectedDepartment(departmentName || null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartment) {
      alert("Please select a department.");
      return;
    }
    // Dummy credentials for demonstration
    if (loginId === "admin" && password === "admin") {
      onLogin(); // Call the onLogin prop from App.tsx
      localStorage.setItem('userDepartment', selectedDepartment); // Store selected department
      navigate(`/departments/${selectedDepartment}`); // Redirect to the selected department page
    } else {
      // For other users, assume loginId is the department
      // In a real app, you'd validate credentials and fetch the user's department from a backend
      if (loginId && password) { // Basic check for non-admin login
        onLogin();
        localStorage.setItem('userDepartment', selectedDepartment); // Store selected department
        navigate(`/departments/${selectedDepartment}`); // Redirect to dynamic department page
      } else {
        alert("Invalid Login ID or Password");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div
        className="flex-grow flex items-center justify-center p-4"
        style={{
          backgroundImage: 'url(/assets/login.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-foreground">Welcome to DocStreamAI</CardTitle>
            <p className="text-muted-foreground">Sign in to your account</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label htmlFor="department-select" className="text-sm font-medium text-foreground block mb-1">
                Select Department
              </label>
              <Select onValueChange={handleDepartmentSelect}>
                <SelectTrigger id="department-select" className="w-full bg-card border-cyan-400 text-foreground focus:ring-primary focus:border-cyan-500">
                  <SelectValue placeholder="Choose your department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Departments</SelectLabel>
                    {departments.map((dept) => (
                      <SelectItem key={dept.name} value={dept.path}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label htmlFor="loginId" className="text-sm font-medium text-foreground block mb-1">
                  Login ID
                </label>
                <Input
                  id="loginId"
                  type="text"
                  placeholder="Enter your Login ID"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  required
                  className="bg-card border-cyan-400 text-foreground focus:ring-primary focus:border-cyan-500"
                />
              </div>
              <div>
                <label htmlFor="password" className="text-sm font-medium text-foreground block mb-1">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-card border-cyan-400 text-foreground focus:ring-primary focus:border-cyan-500"
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary-hover text-primary-foreground">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
