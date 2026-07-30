import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./admin/AdminLayout";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Resume from "./pages/Resume";
import Practice from "./pages/Practice";
import Test from "./pages/Test";
import CompanySelect from "./pages/CompanySelect";
import CodingTest from "./pages/CodingTest";
import Interview from "./pages/Interview";
import Feedback from "./pages/Feedback";
import Submissions from "./pages/Submissions";
import MockInterview from "./pages/MockInterview";
import StartInterview from "./pages/StartInterview";
import PracticeSelection from "./pages/PracticeSElection";
import Upload from "./pages/Upload";
import TestResult from "./pages/TestResult";
import ResumeFeedback from "./pages/ResumeFeedback";

// Admin
import AdminDashboard from "./admin/AdminDashboard";
import Leaderboard from "./admin/Leaderboard";
import MonthlyRanking from "./admin/MonthlyRanking";
import CandidateProfile from "./admin/CandidateProfile";

function App() {
  return (
    <Routes>

      {/* Main Website */}
      <Route
        path="/*"
        element={
          <MainLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/resume" element={<Resume />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/company" element={<CompanySelect />} />
              <Route path="/test/:type" element={<Test />} />
              <Route path="/test/:type/:company" element={<Test />} />
              <Route path="/coding" element={<CodingTest />} />
              <Route path="/interview" element={<Interview />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/submissions" element={<Submissions />} />
              <Route path="/mock-interview" element={<MockInterview />} />
              <Route path="/start-interview" element={<StartInterview />} />
              <Route
                path="/practice-selection"
                element={<PracticeSelection />}
              />
              <Route path="/upload" element={<Upload />} />
              <Route path="/test-result" element={<TestResult />} />
              <Route
                path="/resume-feedback"
                element={<ResumeFeedback />}
              />
            </Routes>
          </MainLayout>
        }
      />

      {/* Admin */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="monthly-ranking" element={<MonthlyRanking />} />
        <Route path="candidate/:id" element={<CandidateProfile />} />
      </Route>

    </Routes>
  );
}

export default App;