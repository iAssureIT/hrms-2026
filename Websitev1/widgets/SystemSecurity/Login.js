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

  const validateForm = () => {
    let errors = {};
    let formIsValid = true;

    if (!email) {
      errors["email"] = "This field is mandatory.";
      formIsValid = false;
    } else if (!validator.isEmail(email)) {
      errors["email"] = "Invalid username.";
      formIsValid = false;
    }

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
            "senior-manager",
            "ho-person",
            "head-csr",
            "head-livelihood",
            "account-person",
          ],
        });
        if (response.data.message === "Login Auth Successful") {
          const userDetails = response.data.userDetails || {};
          ls.set("userDetails", userDetails, { encrypt: true });
          if (userDetails.roles.includes("admin")) {
            window.location.replace("/admin/dashboard");
          } else if (userDetails.roles.includes("center-incharge")) {
            window.location.replace("/center/dashboard");
          } else if (userDetails.roles.includes("account-person")) {
            window.location.replace(
              "/account/utilization-management/utilization-list",
            );
          } else {
            window.location.replace("/executive/dashboard");
          }
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
    Swal.fire(" ", errorMessage);
    setErrorMsg(errorMessage);
  };

  return (
    <div className="w-full flex flex-col items-center lg:items-end">
      {/* Mobile-only Graphic and Text */}
      <div className="lg:hidden w-full flex flex-col items-center px-4 mb-6 mt-3">
        <div className="w-full max-w-sm mb-4">
          <img
            src="/images/specific/Backgroundwithoutsentence.webp"
            alt="Graphic"
            className="w-full h-auto rounded-lg shadow-sm"
          />
        </div>
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-800 text-center mb-4">
          Enriching Lives, Empowering Livelihoods.
        </h2>
      </div>

      <section className="bg-white rounded-lg shadow-xl w-full max-w-[95%] sm:max-w-md mx-auto lg:mx-0 lg:mr-0 sm:mx-10 my-4 lg:my-0 overflow-hidden">
        <div className="w-full">
          <div className="w-full bg-[#E8F5E9] border-t-4 border-green-600 py-4">
            <h1 className="text-xl md:text-2xl text-green-700 font-bold leading-tight text-center">
              Login
            </h1>
          </div>
          <form className="p-6 sm:p-8" action="#" method="POST">
            <div className="mb-6 relative">
              <label
                htmlFor="email"
                className="block text-gray-700 font-semibold mb-2"
              >
                Username
              </label>
              <div className="relative">
                <input
                  className="w-full p-3 bg-blue-50 border border-gray-300 rounded-lg pl-12 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Email ID"
                  onChange={handleChange}
                  value={email}
                  onKeyDown={onlyEmail}
                  autoComplete="true"
                  required
                />
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </span>
              </div>
              {errors.email && (
                <div className="text-red-500 text-xs mt-1">{errors.email}</div>
              )}
            </div>

            <div className="mb-6 relative">
              <label
                htmlFor="password"
                name="passwordLabel"
                className="block text-gray-700 font-semibold mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="w-full p-3 bg-blue-50 border border-gray-300 rounded-lg pl-12 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="Password"
                  onChange={handleChange}
                  value={password}
                  required
                  autoComplete="true"
                />
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                  <i className="fas fa-lock text-lg"></i>
                </span>
                <span
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i
                    className={`fas ${showPassword ? "fa-eye" : "fa-eye-slash"}`}
                  ></i>
                </span>
              </div>
              {errors.password && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.password}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-8">
              <div className="text-left">
                <a
                  href="/auth/forgot-password"
                  className="underline underline-offset-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
                  onClick={() => setLoading(true)}
                >
                  {loading ? (
                    <span className="flex items-center">
                      Forgot Password?
                      <FaSpinner className="animate-spin ml-2" />
                    </span>
                  ) : (
                    "Forgot Password?"
                  )}
                </a>
              </div>
              <button
                type="submit"
                onClick={userlogin}
                disabled={btnLoading || loggedIn}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-10 rounded-lg transition-all shadow-md active:scale-95"
              >
                {btnLoading ? (
                  <FaSpinner className="animate-spin text-white" />
                ) : (
                  "Login"
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Login;
