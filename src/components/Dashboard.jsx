import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeProvider';
import Header from './Header';
import EmailList from './EmailList';
import JobTracker from './JobTracker';
import { Mail, AlertTriangle, Briefcase } from 'lucide-react';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [emailData, setEmailData] = useState({
    unread: [],
    requiresAttention: [],
    loading: false
  });
  const [jobData, setJobData] = useState([]);
  

  const API = import.meta.env.VITE_API_BASE_URL || '';

  // Load from API if logged in; otherwise show mock data
  useEffect(() => {
    const load = async () => {
      if (!token) {
        loadMockData();
        return;
      }
      try {
        setEmailData(prev => ({ ...prev, loading: true }));
        const [unreadRes, attnRes] = await Promise.all([
          fetch(`${API}/api/emails/unread`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/api/emails/requires-attention`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (unreadRes.ok && attnRes.ok) {
          const [unread, requiresAttention] = await Promise.all([unreadRes.json(), attnRes.json()]);
          setEmailData({ unread, requiresAttention, loading: false });
        } else {
          loadMockData();
        }
      } catch {
        loadMockData();
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadMockData = () => {
    // Mock unread emails
    const mockUnreadEmails = [
      {
        id: '1',
        subject: 'Job Application Follow-up',
        sender: 'recruiter@techcorp.com',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        snippet: 'Thank you for your application. We would like to schedule an interview...',
        isUnread: true,
        hasAttachments: false
      },
      {
        id: '2',
        subject: 'Meeting Reminder: Team Standup',
        sender: 'calendar@company.com',
        date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        snippet: 'This is a reminder that you have a meeting scheduled for tomorrow...',
        isUnread: true,
        hasAttachments: false
      },
      {
        id: '3',
        subject: 'New Project Opportunity',
        sender: 'pm@startup.io',
        date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        snippet: 'We have an exciting new project that matches your skills...',
        isUnread: true,
        hasAttachments: true
      },
      {
        id: '4',
        subject: 'Weekly Newsletter',
        sender: 'newsletter@techblog.com',
        date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        snippet: 'This week\'s top articles in web development and AI...',
        isUnread: true,
        hasAttachments: false
      }
    ];

    // Mock requires attention emails
    const mockRequiresAttentionEmails = [
      {
        id: '5',
        subject: 'URGENT: Contract Review Required',
        sender: 'legal@company.com',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        snippet: 'Please review and sign the attached contract by end of week...',
        isUnread: true,
        hasAttachments: true
      },
      {
        id: '6',
        subject: 'Action Required: Security Update',
        sender: 'security@platform.com',
        date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        snippet: 'Your account requires immediate security verification...',
        isUnread: true,
        hasAttachments: false
      },
      {
        id: '7',
        subject: 'Interview Confirmation Needed',
        sender: 'hr@bigtech.com',
        date: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        snippet: 'Please confirm your availability for the technical interview...',
        isUnread: false,
        hasAttachments: false
      }
    ];

    // Mock job applications
    const mockJobs = [
      {
        id: '1',
        companyName: 'TechCorp Inc.',
        positionTitle: 'Senior Frontend Developer',
        status: 'interview',
        applicationDate: '2024-01-15',
        location: 'San Francisco, CA',
        salaryRange: '$120k - $150k',
        notes: 'Technical interview scheduled for next week'
      },
      {
        id: '2',
        companyName: 'StartupXYZ',
        positionTitle: 'Full Stack Engineer',
        status: 'applied',
        applicationDate: '2024-01-10',
        location: 'Remote',
        salaryRange: '$100k - $130k',
        notes: 'Applied through LinkedIn'
      },
      {
        id: '3',
        companyName: 'BigTech Corp',
        positionTitle: 'Software Engineer',
        status: 'screening',
        applicationDate: '2024-01-08',
        location: 'Seattle, WA',
        salaryRange: '$140k - $180k',
        notes: 'Phone screening completed'
      },
      {
        id: '4',
        companyName: 'InnovateLab',
        positionTitle: 'React Developer',
        status: 'offer',
        applicationDate: '2024-01-05',
        location: 'Austin, TX',
        salaryRange: '$110k - $140k',
        notes: 'Offer received, considering'
      }
    ];

    setEmailData({
      unread: mockUnreadEmails,
      requiresAttention: mockRequiresAttentionEmails,
      loading: false
    });
    setJobData(mockJobs);
    // Removed last sync tracking since Recent Activity is removed
  };


  const renderDashboardCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Unread Emails Card */}
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-md transition-shadow duration-200"
        onClick={() => setActiveView('unread')}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
              <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Unread (24h)
            </h3>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {emailData.unread.length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            New emails in last 24 hours
          </p>
          <button className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200">
            View All
          </button>
        </div>
      </div>

      {/* Requires Attention Card */}
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-md transition-shadow duration-200"
        onClick={() => setActiveView('attention')}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Requires Attention
            </h3>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {emailData.requiresAttention.length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Emails needing immediate action
          </p>
          <button className="w-full mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors duration-200">
            View All
          </button>
        </div>
      </div>

      {/* Job Tracker Card */}
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-md transition-shadow duration-200"
        onClick={() => setActiveView('jobs')}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
              <Briefcase className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Job Tracker
            </h3>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {jobData.length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Active job applications
          </p>
          <button className="w-full mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200">
            View Board
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'unread':
        return (
          <EmailList 
            emails={emailData.unread}
            title="Unread Emails (Last 24 Hours)"
            loading={emailData.loading}
            onBack={() => setActiveView('dashboard')}
          />
        );
      case 'attention':
        return (
          <EmailList 
            emails={emailData.requiresAttention}
            title="Emails Requiring Attention"
            loading={emailData.loading}
            onBack={() => setActiveView('dashboard')}
          />
        );
      case 'jobs':
        return (
          <JobTracker 
            jobs={jobData}
            onJobsChange={setJobData}
            onBack={() => setActiveView('dashboard')}
          />
        );
      default:
        return (
          <div>
            {renderDashboardCards()}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
