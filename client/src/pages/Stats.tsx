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
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
                System Statistics
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
<<<<<<< HEAD
                <Badge 
=======
                <Badge
>>>>>>> render/CODES
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
          <Card className="bg-white/80 backdrop-blur-2xl border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-lg font-black text-slate-900 tracking-tighter uppercase">Document Types</CardTitle>
              <CardDescription className="text-slate-500 font-medium">
                Distribution of documents by category
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {statsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="h-4 bg-slate-100 rounded animate-pulse w-full"></div>
                    </div>
                  ))}
                </div>
              ) : stats?.documentTypes && stats.documentTypes.length > 0 ? (
                <div className="space-y-4">
                  {stats.documentTypes.map((type) => (
                    <div key={type._id} className="flex items-center justify-between group">
                      <span className="text-sm font-bold text-slate-600 uppercase tracking-widest text-[10px]">{type._id}</span>
                      <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px] px-2.5 py-1 rounded-lg shadow-sm">{type.count}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No document types discovered in node.</p>
              )}
            </CardContent>
          </Card>

          {/* Profile Distribution */}
          <Card className="bg-white/80 backdrop-blur-2xl border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-lg font-black text-slate-900 tracking-tighter uppercase">Institutional Profiles</CardTitle>
              <CardDescription className="text-slate-500 font-medium">
                Documents tagged by institutional profile
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {statsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="h-4 bg-slate-100 rounded animate-pulse w-full"></div>
                    </div>
                  ))}
                </div>
              ) : stats?.userProfiles && stats.userProfiles.length > 0 ? (
                <div className="space-y-4">
                  {stats.userProfiles.map((profile) => (
                    <div key={profile._id} className="flex items-center justify-between group">
                      <span className="text-sm font-bold text-slate-600 uppercase tracking-widest text-[10px]">{profile._id}</span>
                      <Badge className="bg-cyan-50 text-cyan-600 border-none font-black text-[10px] px-2.5 py-1 rounded-lg shadow-sm">{profile.count}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No institutional profile data available.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Health Details */}
        <Card className="mt-6 bg-white/40 backdrop-blur-3xl border-slate-200 shadow-lg shadow-slate-200/20 rounded-2xl overflow-hidden border-dashed">
          <CardHeader>
            <CardTitle className="text-xs font-black text-slate-900 uppercase tracking-widest">Advanced Integrity Check</CardTitle>
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <div className="space-y-4">
                <div className="h-4 bg-slate-100 rounded animate-pulse w-full"></div>
              </div>
            ) : health ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-white/50 rounded-xl border border-white/60">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Server Protocol</h4>
                  <p className="text-lg font-black text-slate-900 tracking-tighter uppercase">{health.status}</p>
                </div>
                <div className="p-4 bg-white/50 rounded-xl border border-white/60">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Database Stream</h4>
                  <p className="text-lg font-black text-slate-900 tracking-tighter uppercase">{health.database}</p>
                </div>
                <div className="p-4 bg-white/50 rounded-xl border border-white/60">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Calibration</h4>
                  <p className="text-lg font-black text-slate-900 tracking-tighter uppercase">
                    {safeFormatDate(health.timestamp, 'HH:mm:ss', 'Invalid Date')}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">Unable to retrieve system health telemetry.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Stats;
