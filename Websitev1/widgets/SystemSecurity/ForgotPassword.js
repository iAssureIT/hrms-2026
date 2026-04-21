"use client";
import React, { Component } from "react";
import Axios from "axios";
import Swal from "sweetalert2";
import { Modal } from "flowbite-react";
import { MdClose } from "react-icons/md";
import validator from "validator";
import { FaSpinner } from "react-icons/fa";

class ForgotPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      btnLoading: false,
      userName: "",
      fields: {},
      errors: {},
      loading: false,
    };
  }

  validateForm = () => {
    let fields = this.state;
    let errors = {};
    let formIsValid = true;

    if (!fields["userName"]) {
      formIsValid = false;
      errors["userName"] = "Please enter your Email ID";
    } else if (!validator.isEmail(fields["userName"])) {
      errors["userName"] = "Invalid Email ID.";
      formIsValid = false;
    }

    this.setState({
      errors: errors,
    });
    return formIsValid;
  };
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  sendOTP(event) {
    event.preventDefault();
    var userName = this.state.userName;

    var formValues = {
      userName: userName,
      // role: [
      //   "admin",
      //   "center-incharge",
      //   "executive-manager",
      //   "senior-manager",
      //   "head-csr",
      //   "head-livelihood",
      // ],
    };

    if (this.validateForm()) {
      this.setState({ btnLoading: true });

      Axios.post(
        "/api/auth/post/send-otp-forgot-password",
        // "/api/auth/post/send-otp-forgot-password-without-notification",
        formValues,
      )
        .then((forgotPassResponse) => {
          this.setState({ btnLoading: false });
          var msg = forgotPassResponse.data.message;

          if (
            forgotPassResponse.data.message ===
            "OTP sent on your registered email"
          ) {
            Swal.fire(
              " ",
              forgotPassResponse.data.message +
                "<br/>" +
                "Use this OTP to verify your account!",
            ).then(() => {
              window.location.replace(
                "/auth/forgot-password-confirm-otp?username=" +
                  this.state.userName,
              );
            });

            // this.setState({ successModal: true, msg: msg });
            // setSuccessModal(true);
          } else {
            this.setState({ btnLoading: false });
            Swal.fire(" ", forgotPassResponse.data.message);
            // this.setState({ errorModal: true, msg: msg });
          }
        })
        .catch((error) => {
          this.setState({ btnLoading: false });
          console.log("error post send-otp-using-username ==> ", error);
        });
    }
  }
  render() {
    return (
      <section className="bg-white rounded shadow-md w-full max-w-sm my-10 mx-auto sm:m-10">
        <div className="w-full">
          <div className="w-full bg-[#f8fafc] border-t-4 border-[#3c8dbc] py-6 h-20 shadow-sm">
            <h1 className=" text-xl md:text-2xl text-[#3c8dbc] font-black leading-tight text-center tracking-tight">
               Forgot Password
            </h1>
          </div>
          <p className="text-sm text-center px-5 mt-5">
            Please enter your registered email address below to receive an OTP.
          </p>

          <form className="mt-4 p-4 sm:p-8">
            <div className="space-y-2 md:space-y-2 mb-4">
              <label className="inputLabel font-semibold">Email:</label>
              <div className="mb-4 relative">
                <label
                  htmlFor="Email ID"
                  className="block text-sm font-medium dark:text-white"
                >
                  <span className="sr-only">Email ID</span>
                </label>
                <div className="insideIcon">
                  <i className="fa-regular fa-envelope w-5 h-5 pt-1 mr-16"></i>
                </div>
                <input
                  type="text"
                  name="userName"
                  id="userName"
                  value={this.state.userName}
                  placeholder="Enter your email address"
                  // className="stdInput2"
                  className="w-full p-2 border border-gray-300 rounded pl-10 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-[#3c8dbc] border-none outline-none transition-all"
                  autoFocus
                  autoComplete
                  required
                  onChange={this.handleChange.bind(this)}
                />
              </div>
              <div className=" text-left pl-0 errorMsg text-sm mt-1">
                {this.state.errors.userName}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between items-center sm:items-baseline gap-4 sm:gap-0">
              <a
                href="/auth/login"
                className="underline underline-offset-2 sm:pt-5 text-sm font-bold text-[#3c8dbc] hover:text-[#367fa9] transition-colors"
                onClick={() => {
                  this.setState({ loading: true });
                }}
              >
                {this.state.loading ? (
                  <span className="flex items-center">
                    Back to Login
                    <FaSpinner className="animate-spin ml-2 text-lg" />
                  </span>
                ) : (
                  <span>Back to Login</span>
                )}
              </a>
              {this.state.btnLoading ? (
                <button type="submit" className="formButtons mt-4">
                  Sending OTP
                  <FaSpinner className="animate-spin inline-flex mx-2 text-lg text-white text-center" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="formButtons w-full sm:w-auto px-10 sm:mt-4"
                  onClick={this.sendOTP.bind(this)}
                >
                  <span>Send&nbsp;OTP</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* <Modal
          show={this.state.successModal}
          size="md"
          onClose={() => this.setState({ successModal: false })}
          popup
        >
          <Modal.Header className="modalHeader justify-end">
            <div
              className="modalCloseButton"
              onClick={() => this.setState({ successModal: false })}
            >
              <MdClose className="icon text-white font-medium" />
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="modalBody">
              <h3 className="modalText">{this.state.msg}</h3>
              <div className="modelText">
                Use this OTP to verify your account!
              </div>
              <div className="flex justify-center gap-4">
                <button
                  className="modalSuccessBtn"
                  onClick={() => {
                    this.setState({ successModal: false });
                    window.location.replace(
                      "/auth/forgot-password-confirm-otp?username=" +
                        this.state.userName
                    );
                  }}
                >
                  Ok
                </button>
              </div>
            </div>
          </Modal.Body>
        </Modal>

        <Modal
          show={this.state.errorModal}
          size="md"
          onClose={() => this.setState({ errorModal: false })}
          popup
        >
          <Modal.Header className="modalHeader justify-end">
            <div
              className="modalCloseButton"
              onClick={() => this.setState({ errorModal: false })}
            >
              <MdClose className="icon text-white font-medium" />
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="modalBody">
              <h3 className="modalText">{this.state.msg}</h3>
            
              <div className="flex justify-center gap-4">
                <button
                  className="modalSuccessBtn"
                  onClick={() => this.setState({ errorModal: false })}
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
}
export default ForgotPassword;
