"use client";
import React, { useState } from "react";
import Axios from "axios";
import Swal from "sweetalert2";
import validator from "validator";
import { Modal } from "flowbite-react";
import { MdClose } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";
import ls from "localstorage-slim";

function Login(props) {
  const [btnLoading, setBtnLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const [requestModal, setRequestModal] = useState(false);
  const [requestSubmitModal, setRequestSubmitModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState(false);
  const [loading, setLoading] = useState(false);

  const onlyEmail = (event) => {
    // Allow A-Z, a-z, 0-9, !@#$%^&*()_ .
    if (
      (event.which >= 33 && event.which <= 57) ||
      (event.which >= 64 && event.which <= 90) ||
      (event.which >= 95 && event.which <= 122) ||
      event.which === 8 ||
      event.which === 9 ||
      event.which === 46 ||
      event.which === 189 ||
      event.which === 190 ||
      event.which === 37 ||
      event.which === 39
    ) {
      return true;
    } else {
      event.preventDefault();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
  };

  const togglePassword = (event) => {
    event.preventDefault();
    const id = event.currentTarget.id;
    const inputId = id.split("-")[1];

    const icon = document.getElementById(id);
    if (icon.classList.contains("fa-eye-slash")) {
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    } else {
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    }

    const input = document.getElementById(inputId);
    input.type = input.type === "password" ? "text" : "password";
  };

  const validateForm = () => {
    let errors = {};
    let formIsValid = true;

    // Email validation
    if (!email) {
      errors["email"] = "This field is mandatory.";
      formIsValid = false;
    } else if (!validator.isEmail(email)) {
      errors["email"] = "Invalid username.";
      formIsValid = false;
    }

    // Password validation
    if (!password) {
      errors["password"] = "This field is mandatory.";
      formIsValid = false;
    } else if (!validator.isLength(password, { min: 6, max: 40 })) {
      errors["password"] = "Password must be between 6 and 40 characters.";
      formIsValid = false;
    }

    setErrors(errors);
    return formIsValid;
  };

  const userlogin = async (event) => {
    event.preventDefault();

    if (validateForm()) {
      setBtnLoading(true);
      try {
        const response = await Axios.post("/api/auth/post/login", {
          email,
          password,
          role: [
            "admin",
            "center-incharge",
            "executive-manager",
            "admin-executive",
            "senior-manager",
            "ho-person",
            "head-csr",
            "head-livelihood",
            "account-person",
            "account-incharge",
            "accounts-manager",
            "account-admin",
            "asset-manager",
            "asset-incharge",
            "asset-admin",
            "fa-accounts",
          ],
        });
        console.log("response of login api -->", response);

        if (response.data.message === "Login Auth Successful") {
          const userDetails = response.data.userDetails || {};

          ls.set("userDetails", userDetails, { encrypt: true });
          if (userDetails.roles.includes("admin")) {
            window.location.replace("/admin/dashboard");
          } else if (userDetails.roles.includes("center-incharge")) {
            window.location.replace("/center/dashboard");
          } else if (
            userDetails.roles.includes("asset-incharge") ||
            userDetails.roles.includes("asset-admin") ||
            userDetails.roles.includes("fa-accounts")
          ) {
            window.location.replace("/admin/asset-management");
          } else if (
            userDetails.roles.includes("accounts-manager")
          ) {
            window.location.replace("/account/utilization-management/utilization-list");
          } else {
            window.location.replace("/executive/dashboard");
          }
          // userDetails.roles.includes("account-person") ||
          setLoggedIn(true);
        } else {
          handleError(response.data.message);
        }
      } catch (error) {
        handleError(error.message);
      } finally {
        setBtnLoading(false);
      }
    }
  };

  const handleError = (message) => {
    let errorMessage = "";
    switch (message) {
      case "INVALID_PASSWORD":
        errorMessage = "Your password is wrong";
        break;
      case "NOT_REGISTER":
        errorMessage =
          "Not a User Already! Please fill in correct Email Address/Mobile Number or Proceed to Sign Up";
        break;
      case "USER_UNVERIFIED":
        errorMessage =
          "This email is not yet verified. Please click on 'Verify Email' link on Login form to verify your account";
        break;
      case "USER_BLOCK":
        errorMessage =
          "User is blocked. You have attempted 5 wrong password. Please contact admin";
        break;
      default:
        errorMessage = message;
    }
    console.log(errorMessage, "", "error");
    Swal.fire(" ", errorMessage);
    setErrorMsg(errorMessage);
  };
  const sendActivationRequest = () => {
    var adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    const formValues = {
      toEmail: adminEmail,
      subject: "Requesting to update User Status (Active)",
      text: "",
      mail:
        "Dear Admin, <br/>" +
        "I am unable to login as I am blocked. Please update my status to 'Active'<br/> <br/> " +
        "============================  <br/> <br/> " +
        "<b>Email: </b>" +
        email +
        "</pre>" +
        "<br/><br/> ============================ " +
        "<br/><br/> This is a system generated email! ",
    };
    Axios.post("/send-email", formValues)
      .then((res) => {
        if (res.status === 200) {
          Swal.fire(" ", "Activation Request Submitted Successfully!");
        }
      })
      .catch((error) => {
        console.log("error = ", error);
      });
  };

  const sendHelpRequest = () => {
    var adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    const formValues = {
      toEmail: adminEmail,
      subject: "Need Help",
      text: "",
      mail:
        "Dear Admin, <br/>" +
        "This user is having trouble to login to the system.<br/> <br/> " +
        "============================  <br/> <br/> " +
        "<b>Email: </b>" +
        email +
        "</pre>" +
        "<br/><br/> ============================ " +
        "<br/><br/> This is a system generated email! ",
    };
    Axios.post("/send-email", formValues)
      .then((res) => {
        if (res.status === 200) {
          Swal.fire(" ", "Your Request Submitted Successfully!");
        }
      })
      .catch((error) => {
        console.log("error = ", error);
      });
  };

  return (
    <section className="w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#3c8dbc] flex items-center justify-center">
            <i className="fa fa-user text-white text-sm"></i>
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#3c8dbc]">HRMS 2026</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-1">
          Welcome Back
        </h1>
        <p className="text-sm text-slate-500 font-medium">Sign in to your account to continue</p>
      </div>

      <form className="w-full" action="#" method="POST">
        {/* Email Field */}
        <div className="hr-form-group">
          <label className="hr-label" htmlFor="email">
            <i className="fa-regular fa-envelope mr-2 text-slate-400"></i>Email Address
          </label>
          <input
            className="hr-input"
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email address"
            onChange={handleChange}
            value={email}
            onKeyDown={onlyEmail}
            autoFocus
            autoComplete="true"
            required
          />
          {errors.email && (
            <p className="mt-1.5 text-red-500 text-xs font-semibold">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="hr-form-group">
          <label className="hr-label" htmlFor="password">
            <i className="fa fa-lock mr-2 text-slate-400"></i>Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className="hr-input pr-10"
              placeholder="Enter your password"
              onChange={handleChange}
              value={password}
              required
            />
            <span
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 cursor-pointer hover:text-slate-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <span id="id-password" className="fa fa-eye text-sm"></span>
              ) : (
                <span id="id-password" className="fa fa-eye-slash text-sm"></span>
              )}
            </span>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-red-500 text-xs font-semibold">{errors.password}</p>
          )}
        </div>

        {/* Forgot Password */}
        <div className="text-right mb-6">
          <a
            href="/auth/forgot-password"
            className="text-xs font-bold text-[#3c8dbc] hover:text-[#367fa9] transition-colors"
            onClick={() => setLoading(true)}
          >
            {loading ? (
              <><FaSpinner className="animate-spin inline-flex mr-1" /> Loading...</>
            ) : "Forgot Password?"}
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          onClick={userlogin}
          disabled={btnLoading || loggedIn}
          className="hr-btn-primary w-full py-3 text-sm"
        >
          {btnLoading || loggedIn ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              {loggedIn ? "Redirecting..." : "Signing in..."}
            </>
          ) : (
            <>Sign In</>
          )}
        </button>
      </form>
    </section>
  );
}

export default Login;
