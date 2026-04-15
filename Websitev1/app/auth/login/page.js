"use client";
import React, { useState } from "react";
import Axios from "axios";
import Swal from "sweetalert2";
import validator from "validator";
import ls from "localstorage-slim";
import { FaSpinner } from "react-icons/fa";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .lg-root {
    position: fixed;
    inset: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', 'Montserrat', sans-serif;
    background: #f0f4f8;
    background-image:
      radial-gradient(ellipse at 15% 50%, rgba(80,200,120,0.13) 0%, transparent 58%),
      radial-gradient(ellipse at 85% 18%, rgba(99,179,237,0.10) 0%, transparent 55%),
      radial-gradient(ellipse at 58% 88%, rgba(167,139,250,0.09) 0%, transparent 50%);
    padding: 1rem;
  }

  /* Accent bar at very top */
  .lg-top-bar {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #50c878, #38d997 50%, #50c878);
    z-index: 100;
  }

  .lg-wrapper {
    width: 100%;
    max-width: 420px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
  }

  /* ── Logo area (matches sidebar exactly) ── */
  .lg-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 1.75rem;
    cursor: default;
  }
  .lg-brand-icon {
    flex-shrink: 0;
    width: 46px;
    height: 46px;
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 20px rgba(34,197,94,0.35), 0 2px 6px rgba(34,197,94,0.2);
  }
  .lg-brand-icon span {
    color: white;
    font-weight: 900;
    font-size: 1.4rem;
    font-style: italic;
    letter-spacing: -0.05em;
    font-family: 'Inter', sans-serif;
    line-height: 1;
  }
  .lg-brand-text h1 {
    font-size: 1.75rem;
    font-weight: 900;
    color: #1e293b;
    letter-spacing: -0.04em;
    line-height: 1;
    margin: 0;
    font-family: 'Inter', sans-serif;
  }
  .lg-brand-text h1 span { color: #16a34a; }
  .lg-brand-text p {
    font-size: 0.62rem;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    margin: 5px 0 0;
  }

  /* ── Glass Card ── */
  .lg-card {
    width: 100%;
    background: rgba(255,255,255,0.88);
    backdrop-filter: blur(30px) saturate(200%);
    -webkit-backdrop-filter: blur(30px) saturate(200%);
    border-radius: 24px;
    border: 1px solid rgba(255,255,255,0.95);
    box-shadow:
      0 40px 80px rgba(15,23,42,0.13),
      0 16px 32px rgba(15,23,42,0.08),
      0 4px 8px rgba(15,23,42,0.05),
      0 0 0 1px rgba(255,255,255,0.6) inset;
    padding: 2.25rem 2rem 2rem;
    position: relative;
    overflow: hidden;
  }
  /* Green top strip */
  .lg-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #50c878, #38d997 50%, #50c878);
    border-radius: 24px 24px 0 0;
  }
  /* Shiny horizontal line just below the strip */
  .lg-card::after {
    content: '';
    position: absolute;
    top: 3px; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,1) 40%, rgba(255,255,255,1) 60%, transparent);
  }

  /* Card header */
  .lg-card-head { margin-bottom: 1.75rem; padding-top: 0.2rem; }
  .lg-card-head h2 {
    font-size: 1.55rem;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.03em;
    line-height: 1.1;
    margin: 0 0 0.35rem;
    font-family: 'Inter', sans-serif;
  }
  .lg-card-head p {
    font-size: 0.83rem;
    color: #64748b;
    font-weight: 500;
    margin: 0;
  }

  /* Form groups */
  .lg-group { margin-bottom: 1.1rem; }
  .lg-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.7rem;
    font-weight: 700;
    color: #374151;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 0.45rem;
  }
  .lg-label i { color: #22c55e; font-size: 0.75rem; }

  /* Input */
  .lg-input-wrap { position: relative; }
  .lg-input {
    display: block;
    width: 100%;
    padding: 0.78rem 0.95rem;
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    border-radius: 11px;
    font-size: 0.88rem;
    color: #1e293b;
    font-family: 'Inter', 'Montserrat', sans-serif;
    font-weight: 500;
    outline: none;
    transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  }
  .lg-input::placeholder { color: #94a3b8; font-weight: 400; font-size: 0.85rem; }
  .lg-input:focus {
    background: #ffffff;
    border-color: #22c55e;
    box-shadow: 0 0 0 3.5px rgba(34,197,94,0.13);
  }
  .lg-input-pw { padding-right: 2.6rem; }

  .lg-eye {
    position: absolute;
    right: 0.8rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #94a3b8;
    font-size: 0.85rem;
    padding: 0;
    line-height: 1;
    transition: color 0.15s;
  }
  .lg-eye:hover { color: #22c55e; }

  .lg-err {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 5px;
    font-size: 0.71rem;
    font-weight: 600;
    color: #ef4444;
  }
  .lg-err i { font-size: 0.68rem; }

  /* Forgot link */
  .lg-forgot {
    text-align: right;
    margin: 0.15rem 0 1.4rem;
  }
  .lg-forgot a {
    font-size: 0.76rem;
    font-weight: 700;
    color: #16a34a;
    text-decoration: none;
    transition: color 0.15s;
  }
  .lg-forgot a:hover { color: #15803d; text-decoration: underline; }

  /* ── Shiny Submit Button ── */
  .lg-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 0.88rem 1.5rem;
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 55%, #15803d 100%);
    color: #fff;
    font-family: 'Inter', 'Montserrat', sans-serif;
    font-size: 0.88rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border: none;
    border-radius: 11px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow:
      0 4px 16px rgba(34,197,94,0.42),
      0 1px 0 rgba(255,255,255,0.22) inset,
      0 -1px 0 rgba(0,0,0,0.08) inset;
  }
  /* Shiny sweep */
  .lg-btn::before {
    content: '';
    position: absolute;
    top: 0; left: -80%;
    width: 55%;
    height: 100%;
    background: linear-gradient(120deg, transparent, rgba(255,255,255,0.3), transparent);
    transform: skewX(-18deg);
    transition: left 0.55s ease;
  }
  .lg-btn:not(:disabled):hover::before { left: 130%; }
  .lg-btn:not(:disabled):hover {
    transform: translateY(-1.5px);
    box-shadow: 0 8px 28px rgba(34,197,94,0.48), 0 1px 0 rgba(255,255,255,0.22) inset;
  }
  .lg-btn:not(:disabled):active { transform: translateY(0.5px); }
  .lg-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  @keyframes lg-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .lg-spin { animation: lg-spin 0.85s linear infinite; }

  /* Footer */
  .lg-footer {
    margin-top: 1.25rem;
    text-align: center;
    font-size: 0.7rem;
    color: #94a3b8;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
  }
  .lg-footer a {
    color: #64748b;
    font-weight: 700;
    text-decoration: none;
    transition: color 0.15s;
  }
  .lg-footer a:hover { color: #16a34a; }
`;

export default function LoginPage() {
  const [btnLoading, setBtnLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onlyEmail = (event) => {
    if (
      (event.which >= 33 && event.which <= 57) ||
      (event.which >= 64 && event.which <= 90) ||
      (event.which >= 95 && event.which <= 122) ||
      event.which === 8 || event.which === 9 ||
      event.which === 46 || event.which === 189 ||
      event.which === 190 || event.which === 37 || event.which === 39
    ) { return true; } else { event.preventDefault(); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
  };

  const validateForm = () => {
    let errs = {};
    let valid = true;
    if (!email) { errs.email = "This field is mandatory."; valid = false; }
    else if (!validator.isEmail(email)) { errs.email = "Invalid email address."; valid = false; }
    if (!password) { errs.password = "This field is mandatory."; valid = false; }
    else if (!validator.isLength(password, { min: 6, max: 40 })) { errs.password = "Password must be 6–40 characters."; valid = false; }
    setErrors(errs);
    return valid;
  };

  const userlogin = async (event) => {
    event.preventDefault();
    if (validateForm()) {
      setBtnLoading(true);
      try {
        const response = await Axios.post("/api/auth/post/login", {
          email, password,
          role: [
            "admin","center-incharge","executive-manager","admin-executive",
            "senior-manager","ho-person","head-csr","head-livelihood",
            "account-person","account-incharge","accounts-manager","account-admin",
            "asset-manager","asset-incharge","asset-admin","fa-accounts",
          ],
        });
        if (response.data.message === "Login Auth Successful") {
          const userDetails = response.data.userDetails || {};
          ls.set("userDetails", userDetails, { encrypt: true });
          if (userDetails.roles.includes("admin")) { window.location.replace("/admin/dashboard"); }
          else if (userDetails.roles.includes("center-incharge")) { window.location.replace("/center/dashboard"); }
          else if (
            userDetails.roles.includes("asset-incharge") ||
            userDetails.roles.includes("asset-admin") ||
            userDetails.roles.includes("fa-accounts")
          ) { window.location.replace("/admin/asset-management"); }
          else if (userDetails.roles.includes("accounts-manager")) { window.location.replace("/account/utilization-management/utilization-list"); }
          else { window.location.replace("/executive/dashboard"); }
          setLoggedIn(true);
        } else { handleError(response.data.message); }
      } catch (error) { handleError(error.message); }
      finally { setBtnLoading(false); }
    }
  };

  const handleError = (message) => {
    const map = {
      INVALID_PASSWORD: "Your password is incorrect.",
      NOT_REGISTER: "No account found. Please check your email and try again.",
      USER_UNVERIFIED: "This email is not yet verified.",
      USER_BLOCK: "Account blocked after 5 failed attempts. Please contact admin.",
    };
    Swal.fire(" ", map[message] || message);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div className="lg-root">
        <div className="lg-top-bar" />

        <div className="lg-wrapper">

          {/* ── Logo — exact match to sidebar ── */}
          <div className="lg-brand">
            <div className="lg-brand-icon">
              <span>H</span>
            </div>
            <div className="lg-brand-text">
              <h1>HRMS<span>.</span></h1>
              <p>Management Suite</p>
            </div>
          </div>

          {/* ── Glass Card ── */}
          <div className="lg-card">
            <div className="lg-card-head">
              <h2>Welcome Back 👋</h2>
              <p>Sign in to continue to your workspace</p>
            </div>

            <form onSubmit={userlogin} action="#" method="POST" noValidate>
              {/* Email */}
              <div className="lg-group">
                <label className="lg-label" htmlFor="lg-email">
                  <i className="fa-regular fa-envelope"></i> Email Address
                </label>
                <div className="lg-input-wrap">
                  <input
                    className="lg-input"
                    type="email"
                    name="email"
                    id="lg-email"
                    placeholder="you@example.com"
                    onChange={handleChange}
                    value={email}
                    onKeyDown={onlyEmail}
                    autoFocus
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="lg-err">
                    <i className="fa fa-circle-exclamation"></i>{errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="lg-group">
                <label className="lg-label" htmlFor="lg-password">
                  <i className="fa fa-lock"></i> Password
                </label>
                <div className="lg-input-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="lg-password"
                    name="password"
                    className={`lg-input lg-input-pw`}
                    placeholder="Enter your password"
                    onChange={handleChange}
                    value={password}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="lg-eye"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    <i className={showPassword ? "fa fa-eye" : "fa fa-eye-slash"}></i>
                  </button>
                </div>
                {errors.password && (
                  <p className="lg-err">
                    <i className="fa fa-circle-exclamation"></i>{errors.password}
                  </p>
                )}
              </div>

              {/* Forgot */}
              <div className="lg-forgot">
                <a href="/auth/forgot-password" onClick={() => setLoading(true)}>
                  {loading
                    ? <><FaSpinner className="lg-spin" style={{ display: "inline", marginRight: 4 }} /> Loading…</>
                    : "Forgot Password?"
                  }
                </a>
              </div>

              {/* Submit */}
              <button type="submit" disabled={btnLoading || loggedIn} className="lg-btn">
                {btnLoading || loggedIn ? (
                  <>
                    <FaSpinner className="lg-spin" />
                    {loggedIn ? "Redirecting…" : "Signing in…"}
                  </>
                ) : (
                  <>Sign In &nbsp;<i className="fa fa-arrow-right-long" style={{ fontSize: "0.8rem" }}></i></>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="lg-footer">
            Designed &amp; Developed by{" "}
            <a href="https://iassureit.com/" target="_blank" rel="noopener noreferrer">
              iAssure International Technologies
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
