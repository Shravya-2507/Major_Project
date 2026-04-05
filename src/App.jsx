import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./layouts/MainLayout";
import Interview from "./pages/Interview";
import Feedback from "./pages/Feedback";
import StartInterview from "./pages/StartInterview";
import Practice from "./pages/Practice";
import Test from "./pages/Test";
import TestResult from "./pages/TestResult";
import CompanySelect from "./pages/CompanySelect";
import CodingTest from "./pages/CodingTest";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/start-interview" element={<StartInterview />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/test" element={<Test />} />
          <Route path="/test-result" element={<TestResult />} />
          <Route path="/company-select" element={<CompanySelect />} />
          <Route path="/coding" element={<CodingTest />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;