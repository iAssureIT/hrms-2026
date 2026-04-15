"use client";
import React, { useState } from "react";
import Axios from "axios";
import Swal from "sweetalert2";
import validator from "validator";
import ls from "localstorage-slim";
import { FaSpinner } from "react-icons/fa";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  .login-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', 'Montserrat', sans-serif;
    background: #f0f4f8;
    background-image:
      radial-gradient(ellipse at 15% 50%, rgba(80, 200, 120, 0.14) 0%, transparent 60%),
      radial-gradient(ellipse at 85% 20%, rgba(99, 179, 237, 0.10) 0%, transparent 55%),
      radial-gradient(ellipse at 60% 85%, rgba(167, 139, 250, 0.09) 0%, transparent 50%);
    padding: 2rem 1rem;
  }

  .login-wrapper {
    width: 100%;
    max-width: 440px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .login-brand {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1.75rem;
    gap: 0.4rem;
  }
  .brand-logo-wrap {
    width: 62px;
    height: 62px;
    background: linear-gradient(135deg, #50c878 0%, #2daa5a 100%);
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 28px rgba(80, 200, 120, 0.38), 0 2px 8px rgba(80,200,120,0.2);
    margin-bottom: 0.6rem;
  }
  .brand-logo-wrap i { color: white; font-size: 1.55rem; }
  .brand-name {
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #38a169;
  }
  .brand-tagline {
    font-size: 0.8rem;
    color: #64748b;
    font-weight: 500;
  }

  /* Glass Card */
  .login-card {
    width: 100%;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(28px) saturate(200%);
    -webkit-backdrop-filter: blur(28px) saturate(200%);
    border-radius: 26px;
    border: 1px solid rgba(255, 255, 255, 0.95);
    box-shadow:
      0 40px 80px rgba(15, 23, 42, 0.12),
      0 16px 32px rgba(15, 23, 42, 0.08),
      0 0 0 1px rgba(255,255,255,0.7) inset;
    padding: 2.5rem 2.25rem 2.25rem;
    position: relative;
    overflow: hidden;
  }
  .login-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3.5px;
    background: linear-gradient(90deg, #50c878, #38d997 50%, #50c878);
    border-radius: 26px 26px 0 0;
  }
  .login-card::after {
    content: '';
    position: absolute;
    top: 3.5px; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.9) 40%, rgba(255,255,255,0.9) 60%, transparent);
  }

  .card-heading { margin-bottom: 2rem; padding-top: 0.25rem; }
  .card-heading h1 {
    font-size: 1.7rem;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.03em;
    line-height: 1.15;
    margin: 0 0 0.4rem;
  }
  .card-heading p { font-size: 0.85rem; color: #64748b; font-weight: 500; margin: 0; }

  .lg-form-group { margin-bottom: 1.2rem; }
  .lg-label {
    display: block;
    font-size: 0.72rem;
    font-weight: 700;
    color: #374151;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    margin-bottom: 0.5rem;
  }
  .lg-label i { color: #50c878; margin-right: 0.4rem; }

  .lg-input-wrap { position: relative; }
  .lg-input {
    width: 100%;
    padding: 0.82rem 1rem;
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.88rem;
    color: #1e293b;
    font-family: 'Inter', 'Montserrat', sans-serif;
    font-weight: 500;
    outline: none;
    transition: all 0.22s ease;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04) inset;
    box-sizing: border-box;
  }
  .lg-input::placeholder { color: #94a3b8; font-weight: 400; }
  .lg-input:focus {
    background: #ffffff;
    border-color: #50c878;
    box-shadow: 0 0 0 4px rgba(80,200,120,0.13), 0 1px 3px rgba(0,0,0,0.04) inset;
  }
  .lg-input.has-toggle { padding-right: 2.75rem; }

  .lg-eye-toggle {
    position: absolute;
    right: 0.85rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #94a3b8;
    font-size: 0.88rem;
    padding: 0;
    display: flex;
    align-items: center;
    transition: color 0.15s;
    line-height: 1;
  }
  .lg-eye-toggle:hover { color: #50c878; }

  .lg-error {
    margin-top: 0.4rem;
    font-size: 0.72rem;
    font-weight: 600;
    color: #ef4444;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .lg-forgot { text-align: right; margin-bottom: 1.5rem; margin-top: -0.25rem; }
  .lg-forgot a {
    font-size: 0.78rem;
    font-weight: 700;
    color: #50c878;
    text-decoration: none;
    transition: color 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
  .lg-forgot a:hover { color: #2daa5a; text-decoration: underline; }

  /* Shiny green button */
  .lg-submit-btn {
    width: 100%;
    padding: 0.9rem 1.5rem;
    background: linear-gradient(135deg, #50c878 0%, #3bb86a 55%, #2daa5a 100%);
    color: white;
    font-family: 'Inter', 'Montserrat', sans-serif;
    font-size: 0.92rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    position: relative;
    overflow: hidden;
    transition: all 0.25s ease;
    box-shadow:
      0 4px 16px rgba(80, 200, 120, 0.45),
      0 1px 0 rgba(255,255,255,0.28) inset,
      0 -1px 0 rgba(0,0,0,0.08) inset;
    text-transform: uppercase;
  }
  .lg-submit-btn::before {
    content: '';
    position: absolute;
    top: 0; left: -80%;
    width: 55%;
    height: 100%;
    background: linear-gradient(120deg, transparent, rgba(255,255,255,0.32), transparent);
    transform: skewX(-18deg);
    transition: left 0.55s ease;
  }
  .lg-submit-btn:not(:disabled):hover::before { left: 130%; }
  .lg-submit-btn:not(:disabled):hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba(80, 200, 120, 0.5), 0 1px 0 rgba(255,255,255,0.28) inset;
  }
  .lg-submit-btn:not(:disabled):active { transform: translateY(0); }
  .lg-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .spin-icon { animation: spin 0.9s linear infinite; }

  .login-footer {
    margin-top: 1.4rem;
    text-align: center;
    font-size: 0.71rem;
    color: #94a3b8;
    font-weight: 500;
  }
  .login-footer a {
    color: #64748b;
    font-weight: 700;
    text-decoration: none;
    transition: color 0.15s;
  }
  .login-footer a:hover { color: #50c878; }
`;

export default function Page() {
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
          else if (userDetails.roles.includes("asset-incharge") || userDetails.roles.includes("asset-admin") || userDetails.roles.includes("fa-accounts")) { window.location.replace("/admin/asset-management"); }
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
      USER_UNVERIFIED: "This email is not yet verified. Please verify your account.",
      USER_BLOCK: "Account blocked after 5 failed attempts. Please contact admin.",
    };
    Swal.fire(" ", map[message] || message);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div className="login-root">
        <div className="login-wrapper">

          {/* Brand */}
          <div className="login-brand">
            <div className="brand-logo-wrap">
              <i className="fa fa-layer-group"></i>
            </div>
            <span className="brand-name">HRMS 2026</span>
            <span className="brand-tagline">Human Resource Management System</span>
          </div>

          {/* Glass Card */}
          <div className="login-card">
            <div className="card-heading">
              <h1>Welcome Back 👋</h1>
              <p>Sign in to continue to your workspace</p>
            </div>

            <form action="#" method="POST" onSubmit={userlogin}>
              {/* Email */}
              <div className="lg-form-group">
                <label className="lg-label" htmlFor="lg-email">
                  <i className="fa-regular fa-envelope"></i>Email Address
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
                    required
                  />
                </div>
                {errors.email && (
                  <p className="lg-error">
                    <i className="fa fa-circle-exclamation"></i>{errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="lg-form-group">
                <label className="lg-label" htmlFor="lg-password">
                  <i className="fa fa-lock"></i>Password
                </label>
                <div className="lg-input-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="lg-password"
                    name="password"
                    className="lg-input has-toggle"
                    placeholder="Enter your password"
                    onChange={handleChange}
                    value={password}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="lg-eye-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    <i className={showPassword ? "fa fa-eye" : "fa fa-eye-slash"}></i>
                  </button>
                </div>
                {errors.password && (
                  <p className="lg-error">
                    <i className="fa fa-circle-exclamation"></i>{errors.password}
                  </p>
                )}
              </div>

              {/* Forgot Password */}
              <div className="lg-forgot">
                <a href="/auth/forgot-password" onClick={() => setLoading(true)}>
                  {loading
                    ? <><FaSpinner className="spin-icon" style={{ display: "inline" }} /> Loading…</>
                    : "Forgot Password?"
                  }
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={btnLoading || loggedIn}
                className="lg-submit-btn"
              >
                {btnLoading || loggedIn ? (
                  <>
                    <FaSpinner className="spin-icon" />
                    {loggedIn ? "Redirecting…" : "Signing in…"}
                  </>
                ) : (
                  <>Sign In &nbsp;<i className="fa fa-arrow-right-long" style={{ fontSize: "0.82rem" }}></i></>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="login-footer">
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
