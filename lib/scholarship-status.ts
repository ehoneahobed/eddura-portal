import { CheckCircle, Clock, AlertCircle, HelpCircle, Calendar } from 'lucide-react';

export interface ScholarshipStatus {
  isOpen: boolean;
  isExpired: boolean;
  isOpeningSoon: boolean;
  isNotYetOpen: boolean;
  openingDateInfo: {
    status: string;
    color: string;
    icon: any;
    description: string;
  };
  deadlineInfo: {
    status: string;
    color: string;
    icon: any;
    description: string;
    daysLeft: number;
  };
  canApply: boolean;
  applyButtonText: string;
  applyButtonDisabled: boolean;
}

export function getScholarshipStatus(
  deadline: string,
  openingDate?: string
): ScholarshipStatus {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const openingDateObj = openingDate ? new Date(openingDate) : null;
  
  // Calculate days until deadline
  const deadlineDiffTime = deadlineDate.getTime() - now.getTime();
  const daysUntilDeadline = Math.ceil(deadlineDiffTime / (1000 * 60 * 60 * 24));
  
  // Calculate days until opening (if applicable)
  const daysUntilOpening = openingDateObj 
    ? Math.ceil((openingDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  
  // Determine if expired
  const isExpired = daysUntilDeadline < 0;
  
  // Determine opening status
  const isNotYetOpen = openingDateObj ? openingDateObj > now : false;
  const isOpeningSoon = openingDateObj ? daysUntilOpening !== null && daysUntilOpening <= 7 && daysUntilOpening > 0 : false;
  const isOpen = !isNotYetOpen && !isExpired;
  
  // Determine if can apply (students can always start applications, but we show status)
  const canApply = !isExpired;
  
  // Opening date info
  const getOpeningDateInfo = () => {
    if (!openingDate) {
      return {
        status: 'Opening date not specified',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: HelpCircle,
        description: 'No specific opening date provided'
      };
    }
    
    if (isNotYetOpen) {
      if (daysUntilOpening! <= 7) {
        return {
          status: `Opens in ${daysUntilOpening} days`,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Clock,
          description: `Applications will open on ${openingDateObj!.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
          })}`
        };
      } else {
        return {
          status: `Opens ${openingDateObj!.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })}`,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Calendar,
          description: `Applications will open on ${openingDateObj!.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
          })}`
        };
      }
    } else {
      return {
        status: 'Currently Accepting',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        description: 'Applications are currently being accepted'
      };
    }
  };
  
  // Deadline info
  const getDeadlineInfo = () => {
    if (isExpired) {
      return {
        status: 'Application Closed',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: AlertCircle,
        description: 'The application deadline has passed',
        daysLeft: daysUntilDeadline
      };
    }
    
    if (daysUntilDeadline <= 7) {
      return {
        status: `Closes in ${daysUntilDeadline} days`,
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: Clock,
        description: `Application deadline: ${deadlineDate.toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric', 
          month: 'long', 
          day: 'numeric'
        })}`,
        daysLeft: daysUntilDeadline
      };
    }
    
    if (daysUntilDeadline <= 30) {
      return {
        status: `Closes ${deadlineDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        })}`,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Calendar,
        description: `Application deadline: ${deadlineDate.toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric', 
          month: 'long', 
          day: 'numeric'
        })}`,
        daysLeft: daysUntilDeadline
      };
    }
    
    // If scholarship hasn't opened yet, show "Prepare Application" instead of "Currently Accepting"
    if (isNotYetOpen) {
      return {
        status: 'Prepare Application',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Calendar,
        description: `Application deadline: ${deadlineDate.toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric', 
          month: 'long', 
          day: 'numeric'
        })}`,
        daysLeft: daysUntilDeadline
      };
    }
    
    return {
      status: 'Currently Accepting',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
      description: `Application deadline: ${deadlineDate.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      })}`,
      daysLeft: daysUntilDeadline
    };
  };
  
  // Determine apply button text and state
  const getApplyButtonInfo = () => {
    if (isExpired) {
      return {
        text: 'Application Closed',
        disabled: true
      };
    }
    
    if (isNotYetOpen) {
      return {
        text: 'Prepare Application',
        disabled: false
      };
    }
    
    return {
      text: 'Apply Now',
      disabled: false
    };
  };
  
  const applyButtonInfo = getApplyButtonInfo();
  
  return {
    isOpen,
    isExpired,
    isOpeningSoon,
    isNotYetOpen,
    openingDateInfo: getOpeningDateInfo(),
    deadlineInfo: getDeadlineInfo(),
    canApply,
    applyButtonText: applyButtonInfo.text,
    applyButtonDisabled: applyButtonInfo.disabled
  };
}

export function formatDeadline(deadline: string): string {
  const date = new Date(deadline);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return 'Expired';
  } else if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Tomorrow';
  } else if (diffDays <= 7) {
    return `${diffDays} days left`;
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  }
}

export function formatOpeningDate(openingDate: string): string {
  const date = new Date(openingDate);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return 'Opened';
  } else if (diffDays === 0) {
    return 'Opens today';
  } else if (diffDays === 1) {
    return 'Opens tomorrow';
  } else if (diffDays <= 7) {
    return `Opens in ${diffDays} days`;
  } else {
    return `Opens ${date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })}`;
  }
}