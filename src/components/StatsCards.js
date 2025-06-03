import { useState, useEffect } from "react";
import { Ticket, FolderOpen, CheckCircle, Clock, TrendingUp, TrendingDown } from "lucide-react";

export default function StatsCards({ 
  stats = { total: 0, closed: 0, avgTime: 0, teamCount: 0 },
  previousStats = null,
  loading = false 
}) {
  const [animatedStats, setAnimatedStats] = useState(stats);
  
  // Ensure all stats have safe default values
  const safeStats = {
    total: stats.total ?? 0,
    closed: stats.closed ?? 0,
    avgTime: stats.avgTime ?? 0,
    teamCount: stats.teamCount ?? 0,
    open: stats.open ?? 0,
    pending: stats.pending ?? 0,
    resolved: stats.resolved ?? 0
  };
  
  const open = safeStats.total - safeStats.closed;
  const closedPercentage = safeStats.total > 0 ? (safeStats.closed / safeStats.total) * 100 : 0;

  // Animate number changes
  useEffect(() => {
    if (loading) return;
    
    const duration = 1000; // 1 second
    const steps = 60;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    const startStats = animatedStats;
    
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      setAnimatedStats({
        total: Math.round(startStats.total + (safeStats.total - startStats.total) * easeOutQuart),
        closed: Math.round(startStats.closed + (safeStats.closed - startStats.closed) * easeOutQuart),
        avgTime: startStats.avgTime + (safeStats.avgTime - startStats.avgTime) * easeOutQuart,
        teamCount: Math.round(startStats.teamCount + (safeStats.teamCount - startStats.teamCount) * easeOutQuart)
      });
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedStats(safeStats);
      }
    }, stepDuration);
    
    return () => clearInterval(timer);
  }, [safeStats, loading]);

  // Calculate trends if previous stats are provided
  const getTrend = (current, previous) => {
    if (!previousStats || previous === undefined || previous === null) return null;
    const diff = current - previous;
    return { diff, isPositive: diff > 0, isNegative: diff < 0 };
  };

  const trends = previousStats ? {
    total: getTrend(safeStats.total, previousStats.total),
    closed: getTrend(safeStats.closed, previousStats.closed),
    avgTime: getTrend(safeStats.avgTime, previousStats.avgTime),
  } : {};

  const formatTime = (hours) => {
    const safeHours = hours ?? 0;
    if (safeHours < 1) return `${Math.round(safeHours * 60)}m`;
    if (safeHours < 24) return `${safeHours.toFixed(1)}h`;
    return `${(safeHours / 24).toFixed(1)}d`;
  };

  // Safe value formatting function
  const formatValue = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return 0;
    }
    return typeof value === 'string' ? value : Number(value).toLocaleString();
  };

  const cards = [
    {
      id: 'total',
      title: 'Total Tickete',
      value: animatedStats.total ?? 0,
      icon: Ticket,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-500',
      trend: trends.total
    },
    {
      id: 'open',
      title: 'Tickete Deschise',
      value: (animatedStats.total ?? 0) - (animatedStats.closed ?? 0),
      icon: FolderOpen,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-500',
      subtitle: `${((open / safeStats.total) * 100 || 0).toFixed(1)}% din total`
    },
    {
      id: 'closed',
      title: 'Tickete Închise',
      value: animatedStats.closed ?? 0,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-500',
      trend: trends.closed,
      subtitle: `${closedPercentage.toFixed(1)}% completare`
    },
    {
      id: 'avgTime',
      title: 'Timp Mediu Rezolvare',
      value: formatTime(animatedStats.avgTime),
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-500',
      trend: trends.avgTime,
      rawValue: animatedStats.avgTime ?? 0
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <div
          key={card.id}
          className={`group relative overflow-hidden bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border-l-4 ${card.borderColor} hover:scale-105 cursor-pointer`}
        >
          {/* Background gradient effect */}
          <div className={`absolute inset-0 ${card.bgColor} dark:bg-opacity-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
          
          {/* Content */}
          <div className="relative z-10 text-center">
            {/* Icon with animation */}
            <div className="mb-3 relative">
              <card.icon className={`mx-auto text-2xl ${card.iconColor} transform group-hover:scale-110 transition-transform duration-300`} size={32} />
              {card.id === 'closed' && closedPercentage > 0 && (
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-green-400 to-green-600 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              )}
            </div>
            
            {/* Title */}
            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {card.title}
            </h2>
            
            {/* Value with trend */}
            <div className="flex items-center justify-center gap-2 mb-1">
              <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                {formatValue(card.value)}
              </p>
              
              {/* Trend indicator */}
              {card.trend && card.trend.diff !== 0 && (
                <div className={`flex items-center text-xs px-2 py-1 rounded-full ${
                  card.id === 'avgTime' 
                    ? card.trend.isNegative ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    : card.trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {card.id === 'avgTime' ? (
                    card.trend.isNegative ? <TrendingDown size={12} /> : <TrendingUp size={12} />
                  ) : (
                    card.trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />
                  )}
                  <span className="ml-1">
                    {card.id === 'avgTime' 
                      ? formatTime(Math.abs(card.trend.diff))
                      : Math.abs(card.trend.diff)
                    }
                  </span>
                </div>
              )}
            </div>
            
            {/* Subtitle/additional info */}
            {card.subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {card.subtitle}
              </p>
            )}
          </div>
          
          {/* Progress bar for closed tickets */}
          {card.id === 'closed' && safeStats.total > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
              <div 
                className="h-full bg-green-500 transition-all duration-1000 ease-out"
                style={{ width: `${closedPercentage}%` }}
              ></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}