// src/components/GeneratedMail.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";



import "./GeneratedMail.css";
import Navbar from "./Navbar";

export default function GeneratedMail() {

  const backendUri = import.meta.env.VITE_BACKEND_URI;
  
  
  const [userInfoSaved, setUserInfoSaved] = useState(true);  //otherwise it was not redirecting to home 


  const navigate = useNavigate();
  const location = useLocation();
  const draftMail = location.state?.draftMail;
  const role = location.state?.role;

  const [mailBody, setMailBody] = useState(draftMail || "");
  const [subject, setSubject] = useState(
    `Job Application for ${role} role` || "Job Application"
  );
  const [loading, setLoading] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false); // ✅ new loading state for regeneration
  const [message, setMessage] = useState("");

  // Send mail via backend
  const handleSend = async () => {
    if (!location.state?.email) {
      setMessage("⚠️ Recipient email is missing!");
      return;
    }

    if (!mailBody) {
      setMessage("⚠️ Please wait for the mail to be generated.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${backendUri}/sendMail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: location.state?.email, // ✅ recipient email (make sure passed from previous page)
          subject,
          body: mailBody,
        }),
      });
      const data = await res.json();

      if (data.success) {
        alert("✅ Mail sent successfully!");
        navigate("/")
      } else {
        setMessage("❌ Failed to send mail.");
      }
    } catch (err) {
      console.error("Error sending mail:", err);
      setMessage("⚠️ Error sending mail. Check backend.");
    }
    setLoading(false);
  };

  // ✅ Regenerate mail via backend
  const handleRegenerate = async () => {
    if (!mailBody) {
      setMessage("⚠️ No draft available to regenerate.");
      return;
    }
    setRegenLoading(true);
    setMessage("⏳ Regenerating draft...");
    try {
      const res = await fetch(`${backendUri}/regenerateMail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentDraft: mailBody, // in backend you have to access with CurrentDraft key only either const {currrentDraft}=req.body or else currdraft=req.body.currentDraft
        }),
      });
      const data = await res.json();

      if (data.success && data.newDraft) {
        setMailBody(data.newDraft); // ✅ update textarea
        setMessage("✅ Draft regenerated!");
      } else {
        setMessage("❌ Failed to regenerate mail.");
      }
    } catch (err) {
      console.error("Error regenerating mail:", err);
      setMessage("⚠️ Error regenerating mail. Check backend.");
    }
    setRegenLoading(false);
  };

  return (
    <>
       <Navbar onLogout={() => setUserInfoSaved(false)} />
      <div className="generated-mail-container">
        <h2 className="mail-header">📧 AI Job Application Mail</h2>

        {!mailBody && (
          <p className="status-message warning">
            ⚠️ No draft available. Please generate mail first.
          </p>
        )}

        {mailBody && (
          <>
            <label htmlFor="subject" className="mail-label">
              Subject
            </label>
            <input
              id="subject"
              className="mail-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email Subject"
            />

            <label htmlFor="mail-body" className="mail-label">
              Body
            </label>
            <textarea
              id="mail-body"
              className="mail-body"
              rows="12"
              value={mailBody}
              onChange={(e) => setMailBody(e.target.value)}
            />

            <div className="button-group">
              <button
                className="send-button"
                onClick={handleSend}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Mail"}
              </button>

              <button
                className="send-button"
                onClick={handleRegenerate}
                disabled={regenLoading || loading}
              >
                {regenLoading ? " Regenerating..." : " Regenerate"}
              </button>
            </div>
          </>
        )}

        {message && <p className="status-message">{message}</p>}
      </div>
    </>
  );
}
