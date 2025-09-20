import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, Users, FileText, TrendingUp } from "lucide-react";
import { useDataStats, useHealth, useConnectionStats } from "@/hooks/useDocuments";
import { safeFormatDate } from "@/lib/utils";

const Stats = () => {
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDataStats();
  const { data: health, isLoading: healthLoading, refetch: refetchHealth } = useHealth();
  const { data: connections, isLoading: connectionsLoading, refetch: refetchConnections } = useConnectionStats();

  const handleRefresh = async () => {
    await Promise.all([refetchStats(), refetchHealth(), refetchConnections()]);
  };

  const isLoading = statsLoading || healthLoading || connectionsLoading;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">System Statistics</h1>
              <p className="text-muted-foreground mt-2">
                Overview of your document management system
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Documents */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats?.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                All documents in the system
              </p>
            </CardContent>
          </Card>

          {/* Database Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database Status</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={health?.database === 'connected' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {healthLoading ? "..." : health?.database || "Unknown"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {health?.database === 'connected' ? 'All systems operational' : 'Connection issue'}
              </p>
            </CardContent>
          </Card>

          {/* Connected Clients */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {connectionsLoading ? "..." : connections?.connectedClients || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently connected users
              </p>
            </CardContent>
          </Card>

          {/* Server Uptime */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Server Uptime</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {healthLoading ? "..." : health?.uptime ? `${Math.floor(health.uptime / 3600)}h` : "0h"}
              </div>
              <p className="text-xs text-muted-foreground">
                {safeFormatDate(health?.timestamp, 'MMM dd, HH:mm', 'Unknown')}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Document Types */}
          <Card>
            <CardHeader>
              <CardTitle>Document Types</CardTitle>
              <CardDescription>
                Distribution of documents by type
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="h-4 bg-muted rounded animate-pulse w-20"></div>
                      <div className="h-4 bg-muted rounded animate-pulse w-16"></div>
                    </div>
                  ))}
                </div>
              ) : stats?.documentTypes && stats.documentTypes.length > 0 ? (
                <div className="space-y-3">
                  {stats.documentTypes.map((type) => (
                    <div key={type._id} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{type._id}</span>
                      <Badge variant="secondary">{type.count}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No document types found</p>
              )}
            </CardContent>
          </Card>

          {/* Department Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Department Distribution</CardTitle>
              <CardDescription>
                Documents tagged by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
                      <div className="h-4 bg-muted rounded animate-pulse w-16"></div>
                    </div>
                  ))}
                </div>
              ) : stats?.departments && stats.departments.length > 0 ? (
                <div className="space-y-3">
                  {stats.departments.map((dept) => (
                    <div key={dept._id} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{dept._id}</span>
                      <Badge variant="outline">{dept.count}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No department data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Health Details */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>
              Detailed system status and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded animate-pulse w-1/3"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-1/4"></div>
              </div>
            ) : health ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Server Status</h4>
                  <p className="text-lg font-semibold">{health.status}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Database</h4>
                  <p className="text-lg font-semibold capitalize">{health.database}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Last Updated</h4>
                  <p className="text-lg font-semibold">
                    {safeFormatDate(health.timestamp, 'HH:mm:ss', 'Invalid Date')}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Unable to load system health data</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Stats;
