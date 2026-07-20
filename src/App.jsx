import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ToastContainer from './components/common/ToastContainer';
import PageErrorBoundary from './components/common/PageErrorBoundary';
import RouteLoader from './components/common/RouteLoader';
import { RecruitmentProvider } from './context/RecruitmentContext';
import { ToastProvider } from './context/ToastContext';
import DashboardLayout from './layouts/DashboardLayout';

const DashboardPage=lazy(()=>import('./pages/DashboardPage'));
const JobsPage=lazy(()=>import('./pages/JobsPage'));
const JobDetailsPage=lazy(()=>import('./pages/JobDetailsPage'));
const CandidatesPage=lazy(()=>import('./pages/CandidatesPage'));
const CandidateDetailsPage=lazy(()=>import('./pages/CandidateDetailsPage'));
const InterviewsPage=lazy(()=>import('./pages/InterviewsPage'));
const AutomationPage=lazy(()=>import('./pages/AutomationPage'));
const ReportsPage=lazy(()=>import('./pages/ReportsPage'));
const SettingsPage=lazy(()=>import('./pages/SettingsPage'));
const NotFoundPage=lazy(()=>import('./pages/NotFoundPage'));

export default function App() {
  return <ToastProvider><RecruitmentProvider><BrowserRouter><PageErrorBoundary><Suspense fallback={<RouteLoader/>}><Routes><Route element={<DashboardLayout/>}><Route path="/" element={<DashboardPage/>}/><Route path="/jobs" element={<JobsPage/>}/><Route path="/jobs/:jobId" element={<JobDetailsPage/>}/><Route path="/candidates" element={<CandidatesPage/>}/><Route path="/candidates/:candidateId" element={<CandidateDetailsPage/>}/><Route path="/interviews" element={<InterviewsPage/>}/><Route path="/automation" element={<AutomationPage/>}/><Route path="/reports" element={<ReportsPage/>}/><Route path="/settings" element={<SettingsPage/>}/><Route path="*" element={<NotFoundPage/>}/></Route></Routes></Suspense></PageErrorBoundary></BrowserRouter><ToastContainer/></RecruitmentProvider></ToastProvider>;
}
