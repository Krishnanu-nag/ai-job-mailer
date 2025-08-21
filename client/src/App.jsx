import { BrowserRouter, Routes, Route } from "react-router-dom";
import JobMailer from "./components/JobMailer";
import GeneratedMail from "./components/GeneratedMail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<JobMailer />} />
        <Route path="/generatedMail" element={<GeneratedMail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
