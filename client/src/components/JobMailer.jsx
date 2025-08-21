// src/components/JobMailer.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./JobMailer.css";
import Navbar from "./Navbar";

export default function JobMailer() {
  const backendUri = import.meta.env.VITE_BACKEND_URI;

  const [isClicked, setClicked] = useState(false);
  const navigate = useNavigate();

  // Step 1: Collect user info
  const [userInfo, setUserInfo] = useState({
    yourName: "",
    college: "",
    phone: "",
  });

  // Step 2: Job mail form data
  const [formData, setFormData] = useState({
    personName: "",
    company: "",
    role: "",
    jobId: "",
    email: "",
    resume: "",
  });

  const [userInfoSaved, setUserInfoSaved] = useState(false);

  // Load user info from localStorage on component mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userInfo"));
    if (storedUser && storedUser.yourName && storedUser.college && storedUser.phone) {
      setUserInfo(storedUser);
      setUserInfoSaved(true); // Show job mail form directly if already saved
    }
  }, []);

  const handleUserInfoChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUserInfoSubmit = (e) => {
    e.preventDefault();

    // Convert to uppercase and save in localStorage
    const upperCaseUserInfo = {
      yourName: userInfo.yourName.toUpperCase(),
      college: userInfo.college.toUpperCase(),
      phone: userInfo.phone.toUpperCase(),
    };

    localStorage.setItem("userInfo", JSON.stringify(upperCaseUserInfo));

    // Clear input fields in frontend
    setUserInfo({
      yourName: "",
      college: "",
      phone: "",
    });

    // Show Job Mail form
    setUserInfoSaved(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const storedUser = JSON.parse(localStorage.getItem("userInfo"));
    if (!storedUser) {
      alert("Please fill in your basic info first!");
      return;
    }

    try {
      const payload = { ...formData, ...storedUser };
      const res = await axios.post(`${backendUri}/generateMail`, payload);

      navigate("/generatedMail", {
        state: {
          draftMail: res.data.mailBody,
          role: formData.role,
          email: formData.email,
          formData,
        },
      });
    } catch (error) {
      console.error(error);
       setClicked(false)
      alert("Error generating draft mail!");
     
    }
  };

  return (
    <>
      <Navbar onLogout={() => setUserInfoSaved(false)} />
      <div className="jobmailer-container">
        <h2 className="jobmailer-title">Automated Job Mailer</h2>

        {/* Step 1: User Info Form */}
        {!userInfoSaved && (
          <form onSubmit={handleUserInfoSubmit} className="jobmailer-form">
            <h3>Enter Your Info</h3>
            <input
              type="text"
              name="yourName"
              placeholder="Your Name *"
              required
              value={userInfo.yourName}
              onChange={handleUserInfoChange}
              className="jobmailer-input"
            />
            <input
              type="text"
              name="college"
              placeholder="College Name *"
              required
              value={userInfo.college}
              onChange={handleUserInfoChange}
              className="jobmailer-input"
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number *"
              required
              value={userInfo.phone}
              onChange={handleUserInfoChange}
              className="jobmailer-input"
            />
            <button type="submit" className="jobmailer-button">
              Save Info
            </button>
          </form>
        )}

        {/* Step 2: Job Mail Form - show only if user info is saved */}
        {userInfoSaved && (
          <form onSubmit={handleSubmit} className="jobmailer-form">
            <input
              type="text"
              name="personName"
              placeholder="Person Name / HR"
              onChange={handleFormChange}
              className="jobmailer-input"
            />
            <input
              type="text"
              name="company"
              placeholder="Company Name *"
              required
              onChange={handleFormChange}
              className="jobmailer-input"
            />
            <input
              type="text"
              name="role"
              placeholder="Job Role *"
              required
              onChange={handleFormChange}
              className="jobmailer-input"
            />
            <input
              type="text"
              name="jobId"
              placeholder="Job ID (optional)"
              onChange={handleFormChange}
              className="jobmailer-input"
            />
            <input
              type="email"
              name="email"
              placeholder="Recipient Email *"
              required
              onChange={handleFormChange}
              className="jobmailer-input"
            />
            <input
              type="text"
              name="resume"
              placeholder="Resume Google Drive Link *"
              required
              onChange={handleFormChange}
              className="jobmailer-input"
            />
            <button
              type="submit"
              className="jobmailer-button"
              onClick={() => setClicked(true)}
              disabled={
                !formData.company ||
                !formData.role ||
                !formData.email ||
                !formData.resume
              }
            >
              {isClicked ? "Generating..." : "Generate Mail"}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
