import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

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
    <MainLayout>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Main */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/company" element={<CompanySelect />} />
        <Route path="/test/:type" element={<Test />} />
        <Route path="/test/:type/:company" element={<Test />} />
        <Route path="/coding" element={<CodingTest />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/feedback" element={<Feedback />} />
      </Routes>
    </MainLayout>
  );
}

export default App;