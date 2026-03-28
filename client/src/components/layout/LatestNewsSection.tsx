import React from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, AlertTriangle, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

interface LatestNewsSectionProps {
  title?: string;
  userProfileFilter?: string; // New prop for profile filtering
}

interface Alert {
  id: string;
  title: string;
  originalUrgency: string;
  dynamicUrgency: string;
  dueDate: string | null;
  department: string;
  createdAt: string;
}

export const LatestNewsSection = ({ title = "Alerts", userProfileFilter }: LatestNewsSectionProps) => {
  const [isPaused, setIsPaused] = React.useState(false);
  const [currentAlertIndex, setCurrentAlertIndex] = React.useState(0);
  const navigate = useNavigate();

  // Fetch action-required alerts from the API
  const { data: alertsData, isLoading, error } = useQuery({
    queryKey: ['action-required-alerts', userProfileFilter], // Include userProfileFilter in queryKey
    queryFn: async () => {
      const url = userProfileFilter 
        ? `/api/alerts/action-required?user_profile=${userProfileFilter}` 
        : '/api/alerts/action-required';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch alerts: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    retry: 3,
    retryDelay: 1000,
  });

  const alerts: Alert[] = alertsData?.alerts || [];
  
  // Fallback to default message if no alerts
  const displayItems = alerts.length > 0 ? alerts : [{
    id: 'no-alerts',
    title: 'No action-required documents at this time.',
    dynamicUrgency: 'Low',
    originalUrgency: 'Low',
    dueDate: null,
    department: '',
    createdAt: new Date().toISOString()
  }];

  React.useEffect(() => {
    if (!isPaused && displayItems.length > 1) {
      const interval = setInterval(() => {
        setCurrentAlertIndex((prevIndex) => (prevIndex + 1) % displayItems.length);
      }, 5000); // Change alert every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isPaused, displayItems.length]);

  const handlePrev = () => {
    setCurrentAlertIndex((prevIndex) => (prevIndex - 1 + displayItems.length) % displayItems.length);
    setIsPaused(true);
  };

  const handleNext = () => {
    setCurrentAlertIndex((prevIndex) => (prevIndex + 1) % displayItems.length);
    setIsPaused(true);
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  return (
    <div className="bg-cyan-500 text-white py-2 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="font-bold uppercase text-lg">{title}</span>
          {/* Separator Line */}
          <div className="h-6 border-r border-white/50"></div>
          <div className="relative flex-1 group">
            {isLoading ? (
              <span className="block text-sm">Loading alerts...</span>
            ) : error ? (
              <span className="block text-sm">Error loading alerts</span>
            ) : (
              <div className="flex items-center space-x-2">
                <span
                  className="block text-sm transition-opacity duration-300 cursor-pointer hover:underline"
                  onClick={() => {
                    if (displayItems[currentAlertIndex]?.id !== 'no-alerts') {
                      navigate(`/documents/${displayItems[currentAlertIndex]?.id}`);
                    }
                  }}
                >
                  {displayItems[currentAlertIndex]?.title}
                </span>
                {displayItems[currentAlertIndex]?.id !== 'no-alerts' && (
                  <>
                    <UrgencyBadge urgency={displayItems[currentAlertIndex]?.dynamicUrgency} />
                    {displayItems[currentAlertIndex]?.dueDate && (
                      <DueDateBadge dueDate={displayItems[currentAlertIndex]?.dueDate} />
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={handlePrev} className="p-1 rounded-full hover:bg-white/20">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={togglePause} className="p-1 rounded-full hover:bg-white/20">
            {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </button>
          <button onClick={handleNext} className="p-1 rounded-full hover:bg-white/20">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper component for urgency badge
const UrgencyBadge = ({ urgency }: { urgency: string }) => {
  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'High':
        return 'bg-red-500 ring-red-600/10';
      case 'Medium':
        return 'bg-yellow-500 ring-yellow-600/10';
      case 'Low':
        return 'bg-green-500 ring-green-600/10';
      default:
        return 'bg-gray-500 ring-gray-600/10';
    }
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-white ring-1 ring-inset ${getUrgencyColor(urgency)}`}>
      <AlertTriangle className="h-3 w-3 mr-1" />
      {urgency}
    </span>
  );
};

// Helper component for due date badge
const DueDateBadge = ({ dueDate }: { dueDate: string }) => {
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }
  };

  const getDueDateColor = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'bg-red-600 ring-red-700/10';
    } else if (diffDays <= 1) {
      return 'bg-orange-500 ring-orange-600/10';
    } else if (diffDays <= 3) {
      return 'bg-yellow-500 ring-yellow-600/10';
    } else {
      return 'bg-blue-500 ring-blue-600/10';
    }
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-white ring-1 ring-inset ${getDueDateColor(dueDate)}`}>
      <Clock className="h-3 w-3 mr-1" />
      {formatDueDate(dueDate)}
    </span>
  );
};
