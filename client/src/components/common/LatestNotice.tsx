import React, { useState, useEffect } from 'react';

export const LatestNotice = () => {
  const notices = [
    "Important update regarding document submission deadlines. Please check the announcements section for more details.",
    "Scheduled system maintenance on October 26th from 2 AM to 4 AM. Services may be intermittently unavailable.",
    "New guidelines for project proposal submissions have been published. Review the documentation for changes.",
    "Reminder: All departmental reports are due by end of day, September 30th. Ensure all necessary approvals are secured."
  ];

  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);
  const [animationClass, setAnimationClass] = useState("animate-slide-in-right");

  useEffect(() => {
    setAnimationClass("animate-slide-in-right");
    const slideTimer = setInterval(() => {
      setAnimationClass("animate-slide-out-left");
      setTimeout(() => {
        setCurrentNoticeIndex((prevIndex) => (prevIndex + 1) % notices.length);
        setAnimationClass("animate-slide-in-right");
      }, 500); // Duration of slide-out-left animation
    }, 3000); // Change notice every 3 seconds

    return () => clearInterval(slideTimer);
  }, [notices.length]);

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-cyan-50 border-l-4 border-cyan-400 p-4 mb-6 rounded-md shadow-sm overflow-hidden h-16 flex items-center">
        <div key={currentNoticeIndex} className={`flex items-center w-full relative ${animationClass}`}>
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.545 2.503-1.545 3.268 0l7.556 15.28A2 2 0 0118 20H2a2 2 0 01-1.605-2.621l7.556-15.28zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-grow">
            <p className="text-sm text-black font-bold">
              <span>Latest Notice:</span> {notices[currentNoticeIndex]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
