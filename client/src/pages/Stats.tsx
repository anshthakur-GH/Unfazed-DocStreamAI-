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
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
                SYSTEM STATISTICS
              </h1>
              <p className="text-slate-500 mt-2 font-medium tracking-wide">
                Real-time overview of your institutional document node.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
              className="bg-white/70 backdrop-blur-md border-slate-200 text-slate-900 hover:bg-white font-bold tracking-widest uppercase shadow-lg shadow-slate-200/50 transition-all rounded-xl h-11 px-6 active:scale-95"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Node
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Documents */}
          <Card className="bg-white/80 backdrop-blur-2xl border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden transition-all hover:shadow-2xl hover:shadow-blue-900/5 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900 tracking-tighter">
                {statsLoading ? "..." : stats?.total || 0}
              </div>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">
                Synchronized Documents
              </p>
            </CardContent>
          </Card>

          {/* Database Status */}
          <Card className="bg-white/80 backdrop-blur-2xl border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden transition-all hover:shadow-2xl hover:shadow-blue-900/5 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Node Status</CardTitle>
              <Database className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={health?.database === 'connected' ? 'default' : 'destructive'}
                  className={`text-[10px] font-black uppercase tracking-widest px-2 py-0 h-5 border-none ${health?.database === 'connected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                >
                  {healthLoading ? "..." : health?.database || "Unknown"}
                </Badge>
              </div>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">
                {health?.database === 'connected' ? 'All systems operational' : 'Connection issue'}
              </p>
            </CardContent>
          </Card>

          {/* Connected Clients */}
          <Card className="bg-white/80 backdrop-blur-2xl border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden transition-all hover:shadow-2xl hover:shadow-blue-900/5 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Active Nodes</CardTitle>
              <Users className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900 tracking-tighter">
                {connectionsLoading ? "..." : connections?.connectedClients || 0}
              </div>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">
                Parallel Connections
              </p>
            </CardContent>
          </Card>

          {/* Server Uptime */}
          <Card className="bg-white/80 backdrop-blur-2xl border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden transition-all hover:shadow-2xl hover:shadow-blue-900/5 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">System Uptime</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900 tracking-tighter">
                {healthLoading ? "..." : health?.uptime ? `${Math.floor(health.uptime / 3600)}h` : "0h"}
              </div>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">
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

          {/* Profile Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Distribution</CardTitle>
              <CardDescription>
<<<<<<< HEAD
                Documents tagged by user profile
=======
                Documents tagged by institutional profile
>>>>>>> origin/all-updates-unfazed-ai
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
<<<<<<< HEAD
              ) : stats?.profiles && stats.profiles.length > 0 ? (
                <div className="space-y-3">
                  {stats.profiles.map((prof) => (
                    <div key={prof._id} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{prof._id}</span>
                      <Badge variant="outline">{prof.count}</Badge>
=======
              ) : stats?.userProfiles && stats.userProfiles.length > 0 ? (
                <div className="space-y-3">
                  {stats.userProfiles.map((profile) => (
                    <div key={profile._id} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{profile._id}</span>
                      <Badge variant="outline">{profile.count}</Badge>
>>>>>>> origin/all-updates-unfazed-ai
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No profile data available</p>
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
