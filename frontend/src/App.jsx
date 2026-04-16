import { Routes, Route } from "react-router-dom";

// Layouts
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";

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

function App() {
  return (
    <Routes>

      {/* Public Routes (No Sidebar) */}
      <Route path="/" element={<MainLayout><Home /></MainLayout>} />
      <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
      <Route path="/signup" element={<MainLayout><Signup /></MainLayout>} />

      {/* Dashboard Routes (With Sidebar) */}
      <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
      <Route path="/resume" element={<DashboardLayout><Resume /></DashboardLayout>} />
      <Route path="/practice" element={<DashboardLayout><Practice /></DashboardLayout>} />
      <Route path="/company" element={<DashboardLayout><CompanySelect /></DashboardLayout>} />
      <Route path="/test/:type" element={<DashboardLayout><Test /></DashboardLayout>} />
      <Route path="/test/:type/:company" element={<DashboardLayout><Test /></DashboardLayout>} />
      <Route path="/coding" element={<DashboardLayout><CodingTest /></DashboardLayout>} />
      <Route path="/interview" element={<DashboardLayout><Interview /></DashboardLayout>} />
      <Route path="/feedback" element={<DashboardLayout><Feedback /></DashboardLayout>} />

    </Routes>
  );
}

export default App;