import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import { LandingHeader } from './components/landing/LandingHeader';
import { CinematicHero } from './components/landing/CinematicHero';
import { FeatureGrid } from './components/landing/FeatureGrid';
import { RoleShowcase } from './components/landing/RoleShowcase';
import { NfcShowcase } from './components/landing/NfcShowcase';
import { DemoCredentialsSection } from './components/landing/DemoCredentialsSection';
import { LandingFooter } from './components/landing/LandingFooter';

import { LoginModal } from './components/auth/LoginModal';
import { FirstLoginPasswordModal } from './components/auth/FirstLoginPasswordModal';
import { AppShell } from './components/layout/AppShell';

import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { TeacherDashboard } from './components/dashboard/TeacherDashboard';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { ParentDashboard } from './components/dashboard/ParentDashboard';
import { FinanceDashboard } from './components/dashboard/FinanceDashboard';

import { StudentManagement } from './components/management/StudentManagement';
import { TeacherManagement } from './components/management/TeacherManagement';
import { ParentManagement } from './components/management/ParentManagement';
import { AcademicManagement } from './components/management/AcademicManagement';
import { AttendanceManagement } from './components/management/AttendanceManagement';
import { PaymentManagement } from './components/management/PaymentManagement';
import { AnnouncementManagement } from './components/management/AnnouncementManagement';

import { StudentProfileView } from './components/student/StudentProfileView';
import { StudentAttendanceView } from './components/student/StudentAttendanceView';
import { StudentTimetableView } from './components/student/StudentTimetableView';
import { StudentSubjectsView } from './components/student/StudentSubjectsView';
import { StudentClassroomsView } from './components/student/StudentClassroomsView';
import { TeacherProfileView } from './components/teacher/TeacherProfileView';
import { TeacherFeedbackView } from './components/teacher/TeacherFeedbackView';
import { AdminFeedbackView } from './components/dashboard/AdminFeedbackView';
import { TeacherExamManagement } from './components/teacher/TeacherExamManagement';
import { StudentExamPortal } from './components/student/StudentExamPortal';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, roles, user } = useAuth();

  const [activePage, setActivePage] = useState<'landing' | 'dashboard'>(() => {
    return localStorage.getItem('bfa_access_token') ? 'dashboard' : 'landing';
  });

  const [currentView, setCurrentView] = useState<string>('dashboard');

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleOpenLogin = (email = '', password = '') => {
    setLoginEmail(email);
    setLoginPassword(password);
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (defaultRoute: string) => {
    setActivePage('dashboard');
    setCurrentView('dashboard');
  };

  const handleNavigateSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Render role-specific dashboard overview
  const renderDashboardView = () => {
    // If the authenticated user is a STUDENT, route to dedicated Student Portal views
    if (roles.includes('STUDENT')) {
      if (currentView === 'student-profile') {
        return <StudentProfileView />;
      }
      if (currentView === 'student-attendance' || currentView === 'attendance' || currentView === 'attendance-stats') {
        return <StudentAttendanceView />;
      }
      if (currentView === 'student-timetable' || currentView === 'timetables') {
        return <StudentTimetableView />;
      }
      if (currentView === 'student-subjects' || currentView === 'subjects' || currentView === 'classes') {
        return <StudentSubjectsView />;
      }
      if (currentView === 'student-classrooms' || currentView === 'classrooms') {
        return <StudentClassroomsView />;
      }
      if (currentView === 'student-feedback') {
        return <StudentDashboard onNavigateView={(view) => setCurrentView(view)} initialTab="feedback" />;
      }
      if (currentView === 'student-exams' || currentView === 'exams') {
        return <StudentExamPortal />;
      }
      if (currentView === 'announcements') {
        return <AnnouncementManagement />;
      }
      return <StudentDashboard onNavigateView={(view) => setCurrentView(view)} />;
    }

    // If the authenticated user is a PARENT, route to dedicated Parent Portal views
    if (roles.includes('PARENT')) {
      if (currentView === 'parent-feedback') {
        return <ParentDashboard initialTab="feedback" />;
      }
      if (currentView === 'parent-profile') {
        return <ParentDashboard initialTab="profile" />;
      }
      if (currentView === 'announcements') {
        return <AnnouncementManagement />;
      }
      return <ParentDashboard />;
    }

    // If the authenticated user is a TEACHER, handle dedicated Teacher views
    if (roles.includes('TEACHER')) {
      if (currentView === 'teacher-exams' || currentView === 'exams') {
        return <TeacherExamManagement />;
      }
      if (currentView === 'teacher-profile') {
        return <TeacherProfileView />;
      }
      if (currentView === 'teacher-feedback') {
        return <TeacherFeedbackView />;
      }
      if (currentView === 'attendance' || currentView === 'attendance-stats') {
        return <AttendanceManagement />;
      }
      if (currentView === 'students') {
        return <StudentManagement />;
      }
      if (['classes', 'classrooms', 'subjects', 'timetables'].includes(currentView)) {
        return <AcademicManagement />;
      }
      if (currentView === 'announcements') {
        return <AnnouncementManagement />;
      }
      return <TeacherDashboard onNavigateView={(view) => setCurrentView(view)} />;
    }

    if (currentView === 'students') return <StudentManagement />;
    if (currentView === 'teachers') return <TeacherManagement />;
    if (currentView === 'parents') return <ParentManagement />;
    if (['classes', 'classrooms', 'subjects', 'timetables'].includes(currentView)) {
      return <AcademicManagement />;
    }
    if (currentView === 'attendance' || currentView === 'attendance-stats') {
      return <AttendanceManagement />;
    }
    if (currentView === 'payments' || currentView === 'fee-structures' || currentView === 'fee-balance') {
      return <PaymentManagement />;
    }
    if (currentView === 'announcements') return <AnnouncementManagement />;
    if (currentView === 'admin-feedback') return <AdminFeedbackView />;
    if (currentView === 'teacher-exams' || currentView === 'exams') return <TeacherExamManagement />;
    if (currentView === 'student-exams') return <StudentExamPortal />;

    // Default overview for each role
    if (roles.includes('ADMINISTRATOR')) {
      return <AdminDashboard onQuickNavigate={(view) => setCurrentView(view)} />;
    }
    if (roles.includes('TEACHER')) {
      return <TeacherDashboard onNavigateView={(view) => setCurrentView(view)} />;
    }
    if (roles.includes('PARENT')) {
      return <ParentDashboard />;
    }
    if (roles.includes('FINANCE_OFFICER')) {
      return <FinanceDashboard onNavigateView={(view) => setCurrentView(view)} />;
    }

    return <AdminDashboard onQuickNavigate={(view) => setCurrentView(view)} />;
  };

  return (
    <>
      {activePage === 'landing' || !isAuthenticated ? (
        <div style={{ position: 'relative', minHeight: '100vh' }}>
          <LandingHeader
            onLoginClick={() => handleOpenLogin()}
            onDashboardClick={() => setActivePage('dashboard')}
            onNavigateSection={handleNavigateSection}
          />

          <main>
            <CinematicHero
              onLoginClick={() => handleOpenLogin()}
              onExploreClick={() => handleNavigateSection('features')}
            />

            <FeatureGrid />

            <RoleShowcase
              onSelectRoleDemo={(email) => handleOpenLogin(email, 'abcd123')}
            />

            <NfcShowcase />

            <DemoCredentialsSection
              onSelectAccount={(email, pass) => handleOpenLogin(email, pass)}
            />
          </main>

          <LandingFooter />
        </div>
      ) : (
        <AppShell
          currentView={currentView}
          onNavigateView={(view) => setCurrentView(view)}
          onBackToLanding={() => setActivePage('landing')}
        >
          {renderDashboardView()}
        </AppShell>
      )}

      {/* Login Authentication Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        initialEmail={loginEmail}
        initialPassword={loginPassword}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* First-Login Password Setup for newly registered students */}
      {isAuthenticated && Boolean(user?.passwordChangeRequired) && (
        <FirstLoginPasswordModal
          isOpen={true}
          onSuccess={() => {}}
        />
      )}
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <MainAppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
