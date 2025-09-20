import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiService } from "@/services/api";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const TestConnection = () => {
  const [testResults, setTestResults] = useState<{
    health?: any;
    data?: any;
    error?: string;
    loading: boolean;
  }>({ loading: false });

  const runTests = async () => {
    setTestResults({ loading: true });
    
    try {
      console.log("Testing API connection...");
      
      // Test health endpoint
      const health = await apiService.getHealth();
      console.log("Health check result:", health);
      
      // Test data endpoint
      const data = await apiService.getDocuments({ limit: 5 });
      console.log("Data fetch result:", data);
      
      setTestResults({
        health,
        data,
        loading: false
      });
    } catch (error) {
      console.error("Test failed:", error);
      setTestResults({
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Connection Test</h1>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test API Endpoints</CardTitle>
              <CardDescription>
                Click the button below to test the connection to your backend API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={runTests} 
                disabled={testResults.loading}
                className="mb-4"
              >
                {testResults.loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Run Tests'
                )}
              </Button>
              
              {testResults.error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center space-x-2 text-destructive">
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">Connection Failed</span>
                  </div>
                  <p className="mt-2 text-sm">{testResults.error}</p>
                </div>
              )}
              
              {testResults.health && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Health Check Passed</span>
                    </div>
                    <div className="mt-2 space-y-1 text-sm">
                      <p><strong>Status:</strong> {testResults.health.status}</p>
                      <p><strong>Database:</strong> 
                        <Badge className={`ml-2 ${testResults.health.database === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {testResults.health.database}
                        </Badge>
                      </p>
                      <p><strong>Uptime:</strong> {Math.floor(testResults.health.uptime / 3600)}h {Math.floor((testResults.health.uptime % 3600) / 60)}m</p>
                    </div>
                  </div>
                  
                  {testResults.data && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2 text-blue-800">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Data Fetch Passed</span>
                      </div>
                      <div className="mt-2 space-y-1 text-sm">
                        <p><strong>Total Documents:</strong> {testResults.data.pagination?.total || 0}</p>
                        <p><strong>Documents Returned:</strong> {testResults.data.data?.length || 0}</p>
                        <p><strong>Has More:</strong> {testResults.data.pagination?.hasMore ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>
                Expected endpoints that should be available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm font-mono">
                <div>GET http://localhost:4000/api/health</div>
                <div>GET http://localhost:4000/api/data</div>
                <div>POST http://localhost:4000/api/createData</div>
                <div>GET http://localhost:4000/api/stats/data</div>
                <div>GET http://localhost:4000/api/stats/connections</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestConnection;
