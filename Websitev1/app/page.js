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
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', 'Montserrat', sans-serif;
    background: #f4f7f9;
    background-image: 
      radial-gradient(circle at 10% 10%, rgba(60, 141, 188, 0.2) 0%, transparent 40%),
      radial-gradient(circle at 90% 90%, rgba(60, 141, 188, 0.15) 0%, transparent 40%),
      url('https://www.transparenttextures.com/patterns/cubes.png');
    overflow: hidden;
    position: relative;
  }

  /* Decorative Orbs */
  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    z-index: 0;
    opacity: 0.5;
  }
  .orb-1 { width: 300px; height: 300px; background: rgba(60, 141, 188, 0.3); top: -50px; left: -50px; }
  .orb-2 { width: 250px; height: 250px; background: rgba(54, 127, 169, 0.2); bottom: -30px; right: -30px; }

  .login-wrapper {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 10;
  }

  .login-brand {
    display: flex;
    align-items: center;
    margin-bottom: 1.25rem;
    gap: 1.25rem;
  }
  .brand-logo-wrap {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #3c8dbc 0%, #367fa9 100%);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 25px rgba(60, 141, 188, 0.3);
    transition: transform 0.3s ease;
  }
  .brand-logo-wrap:hover { transform: scale(1.05); }
  .brand-logo-wrap i { color: white; font-size: 1.6rem; }
  
  .brand-text-wrap {
    display: flex;
    flex-direction: column;
  }
  .brand-name {
    font-size: 1.75rem;
    font-weight: 900;
    letter-spacing: -0.01em;
    color: #1e293b;
    margin: 0;
    line-height: 1.1;
  }
  .brand-name span { color: #3c8dbc; }
  
  .brand-tagline {
    font-size: 0.65rem;
    color: #64748b;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    margin-top: 2px;
  }

  /* Glass Card */
  .login-card {
    width: 100%;
    background: rgba(255, 255, 255, 0.94);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border-radius: 22px;
    border: 1px solid rgba(255, 255, 255, 1);
    box-shadow: 
      0 30px 60px -12px rgba(0, 0, 0, 0.12),
      0 0 0 1px rgba(60, 141, 188, 0.04) inset;
    padding: 2.25rem 2.25rem;
    position: relative;
  }
  
  .login-card::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3.5px;
    background: #3c8dbc;
    border-radius: 22px 22px 0 0;
  }

  .card-heading { margin-bottom: 2rem; text-align: left; }
  .card-heading h1 {
    font-size: 1.5rem;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 0.35rem;
    letter-spacing: -0.01em;
  }
  .card-heading p { font-size: 0.82rem; color: #64748b; font-weight: 500; }

  .lg-form-group { margin-bottom: 1.15rem; }
  .lg-label {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 0.68rem;
    font-weight: 800;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 0.55rem;
  }
  .lg-label i { color: #3c8dbc; font-size: 0.75rem; }

  .lg-input-wrap { position: relative; }
  .lg-input {
    width: 100%;
    padding: 0.8rem 1rem;
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    border-radius: 11px;
    font-size: 0.88rem;
    color: #1e293b;
    font-family: inherit;
    font-weight: 500;
    outline: none;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .lg-input::placeholder { color: #94a3b8; font-weight: 400; }
  .lg-input:focus {
    background: #ffffff;
    border-color: #3c8dbc;
    box-shadow: 0 0 0 3.5px rgba(60, 141, 188, 0.1);
  }

  .lg-eye-toggle {
    position: absolute;
    right: 0.9rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #94a3b8;
    transition: color 0.15s;
    padding: 3px;
  }
  .lg-eye-toggle:hover { color: #3c8dbc; }

  .lg-error {
    margin-top: 0.4rem;
    font-size: 0.7rem;
    font-weight: 600;
    color: #ef4444;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .lg-forgot { text-align: right; margin-bottom: 1.5rem; }
  .lg-forgot a {
    font-size: 0.78rem;
    font-weight: 700;
    color: #3c8dbc;
    text-decoration: none;
    transition: all 0.2s;
  }
  .lg-forgot a:hover { color: #367fa9; text-decoration: underline; }

  .lg-submit-btn {
    width: 100%;
    padding: 0.9rem;
    background: linear-gradient(135deg, #3c8dbc 0%, #367fa9 100%);
    color: white;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    border: none;
    border-radius: 11px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    box-shadow: 0 6px 15px rgba(60, 141, 188, 0.25);
    transition: all 0.25s ease;
    text-transform: uppercase;
  }
  .lg-submit-btn:not(:disabled):hover {
    transform: translateY(-1.5px);
    box-shadow: 0 10px 20px rgba(60, 141, 188, 0.35);
    filter: brightness(1.04);
  }
  .lg-submit-btn:not(:disabled):active { transform: translateY(0); }
  .lg-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

  .login-footer {
    margin-top: 1.25rem;
    text-align: center;
    font-size: 0.72rem;
    color: #64748b;
    font-weight: 500;
  }
  .login-footer a {
    color: #3c8dbc;
    font-weight: 700;
    text-decoration: none;
  }
  .login-footer a:hover { text-decoration: underline; }

  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .spin-icon { animation: spin 1s linear infinite; }
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
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>

        <div className="login-wrapper">

          {/* Brand */}
          <div className="login-brand">
            <div className="brand-logo-wrap">
              <i className="fa fa-cube"></i>
            </div>
            <div className="brand-text-wrap">
              <h1 className="brand-name">HRMS<span>.</span></h1>
              <p className="brand-tagline">Management Suite</p>
            </div>
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
