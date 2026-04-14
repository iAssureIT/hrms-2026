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
        console.log("response of login api -->",response);
        
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
    // <section className="formWrapper bg-white mx-20 sm:w-3/4 md:w-1/2 xl:w-1/3 bg-white-100 px-5 shadow-xl border rounded-lg  my-20 py-10 xxl:py-20 mx-20">
    <section className="bg-white rounded shadow-md w-full max-w-sm max-h-[80dvh] overflow-y-auto">
      <div className="w-full">
        <div className="w-full bg-lightgreen border border-2 border-t-green py-6 h-20">
          <h1 className=" text-xl md:text-2xl text-green font-bold leading-tight text-center">
            Login
          </h1>
        </div>
        <form className="p-4 sm:p-8" action="#" method="POST">
          <div className="mb-4 relative">
            <label
              htmlFor="email"
              className="block inputLabel font-semibold mb-2"
            >
              Username
            </label>
            <div className="relative">
              <input
                className="w-full p-2 bg-white border border-gray-300 rounded pl-10 ring-1 ring-inset ring-grayThree focus:ring-2 focus:ring-inset focus:ring-green border-none outline-none"
                type="email"
                name="email"
                id="email"
                placeholder="Email ID"
                onChange={handleChange}
                value={email}
                onKeyDown={onlyEmail}
                autoFocus
                autoComplete="true"
                required
              />

              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </span>
            </div>

            <div className="text-left pl-0 errorMsg mt-1 text-red-500">
              {errors.email}
            </div>
          </div>
          <div className="mb-4 relative">
            <label
              htmlFor="password"
              className="block inputLabel font-semibold mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="w-full p-2 border border-gray-300 rounded pl-10 ring-1 ring-inset ring-grayThree focus:ring-2 focus:ring-inset focus:ring-green  bg-white border-none outline-none"
                placeholder="Password"
                onChange={handleChange}
                value={password}
                required
                autoFocus
                autoComplete="true"
              />
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <i className="fas fa-lock absolute left-0 top-1/2 transform -translate-y-1/2 ml-3 text-gray-400"></i>
              </span>
              <span
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <span
                    id="id-password"
                    className={
                      "fa fa-eye toggleEye absolute top-3 text-gray-400 right-4"
                    }
                  ></span>
                ) : (
                  <span
                    id="id-password"
                    className={
                      "fa fa-eye-slash toggleEye absolute top-3 text-gray-400 right-4"
                    }
                  ></span>
                )}
              </span>
            </div>
            <div className="text-left pl-0 errorMsg mt-1 text-red-500">
              {errors.password}
            </div>
          </div>
          <div className="flex flex-col lg:flex-row lg:justify-between gap-4 items-center sm:items-baseline  md:items-center lg:items-center">
            {" "}
            <div className="text-left lg:mt-4">
              <a
                href="/auth/forgot-password"
                className="underline underline-offset-2  text-sm font-semibold inputLabel text-green-500 hover:text-green-700 focus:text-blue-800"
                onClick={() => {
                  setLoading(true);
                }}
              >
                {loading ? (
                  <span className="text-green-500 hover:text-green-700 focus:text-blue-800">
                    Forgot Password?
                    <FaSpinner className="animate-spin inline-flex mx-2 text-lg text-green text-center" />
                  </span>
                ) : (
                  <span className="text-sm text-green-500 hover:text-green-700 focus:text-blue-800">
                    Forgot Password?
                  </span>
                )}
              </a>
            </div>
            <button
              type="submit"
              onClick={userlogin}
              disabled={btnLoading || loggedIn}
              className="formButtons px-10"
            >
              {loggedIn ? (
                <span>
                  Login
                  <FaSpinner className="animate-spin inline-flex mx-2 text-lg text-white text-center" />
                </span>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* <Modal
        show={requestModal}
        size="md"
        onClose={() => setRequestModal(false)}
        popup
      >
        <Modal.Header className="modalHeader justify-end">
          <div
            className="modalCloseButton"
            onClick={() => setRequestModal(false)}
          >
            <MdClose className="icon text-white font-medium" />
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="modalBody">
            <h3 className="modalText">
              Activation request submitted successfully
            </h3>
            <div className="flex justify-center gap-4">
              <button
                className="modalSuccessBtn"
                onClick={() => setRequestModal(false)}
              >
                Ok
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={requestSubmitModal}
        size="md"
        onClose={() => setRequestSubmitModal(false)}
        popup
      >
        <Modal.Header className="modalHeader justify-end">
          <div
            className="modalCloseButton"
            onClick={() => setRequestSubmitModal(false)}
          >
            <MdClose className="icon text-white font-medium" />
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="modalBody">
            <h3 className="modalText">Your request submitted successfully</h3>
            <div className="flex justify-center gap-4">
              <button
                className="modalSuccessBtn"
                onClick={() => setRequestSubmitModal(false)}
              >
                Ok
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={errorModal}
        size="md"
        onClose={() => setErrorModal(false)}
        popup
      >
        <Modal.Header className="modalHeader justify-end">
          <div
            className="modalCloseButton"
            onClick={() => setErrorModal(false)}
          >
            <MdClose className="icon text-white font-medium" />
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="modalBody">
            {errorMsg ? (
              <h3 className="modalText">{errorMsg}</h3>
            ) : (
              <>
                <h3 className="modalText">Oops!</h3>
                <div className="modalText">Something went wrong</div>
              </>
            )}

            <div className="flex justify-center gap-4">
              <button
                className="modalSuccessBtn"
                onClick={() => setErrorModal(false)}
              >
                Ok
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal> */}
    </section>
  );
}

export default Login;
