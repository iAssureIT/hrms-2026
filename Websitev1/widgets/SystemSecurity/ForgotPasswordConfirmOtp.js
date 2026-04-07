/*==========================================================
  Developer  :  Priyanka Bhanvase
  Date       :  
  ------------------------------------
  Reviewed By:  
  Review Date: 
==========================================================*/
"use client";
import React, { Component } from "react";
import OtpInput from "react-otp-input";
import Axios from "axios";
import Swal from "sweetalert2";
import Countdown from "react-countdown";
import { Modal } from "flowbite-react";
import { MdClose } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";

export default class ForgotPasswordConfirmOtp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userID: "",
      otp: "",
      OTPresent: false,
      countdown: 0,
      otpSentModal: false,
      otpVerifyModal: false,
      errorModal: false,
      msg: "",
      loading: false,
      loading2: false,
    };
  }

  handleChange = (otp) => this.setState({ otp });

  componentDidMount() {
    var url = window.location.href.split("="); // return segment1/segment2/segment3/segment4
    var DecodedUrl = decodeURIComponent(url[1]);
    // console.log(decodeURIComponent(url));
    this.setState({
      userName: DecodedUrl,
    });
  }
  renderer = ({ hours, minutes, seconds, completed }) => {
    if (completed) {
      this.setState({ OTPresent: false });
      return <span>You are good to go!</span>;
    } else {
      return (
        <span>
          {" "}
          <span className="text-primary">Resent OTP</span> after{" "}
          <span className="text-primary">{seconds}</span> seconds
        </span>
      );
    }
  };

  resendOTP(event) {
    event.preventDefault();
    if (this.state.userName) {
      var formValues = {
        userName: this.state.userName,
        role: ["admin"],
      };

      Axios.post("/api/auth/post/send-otp-forgot-password", formValues)
        .then((otpResponse) => {
          if (otpResponse) {
            this.setState({ otp: "", OTPresent: true });
            Swal.fire(
              " ",
              "OTP resent to your registered email address! <br/>" +
                "Please Enter your new OTP"
            );
            // this.setState({ otpSentModal: true });
          }
        })
        .catch((error) => {
          console.log("error while resending otp==", error);
        });
    }
  }

  verifyOTP(event) {
    event.preventDefault();

    var formValues = {
      userName: this.state.userName,
      OTP: this.state.otp,
      role: [
        "admin",
        "center-incharge",
        "executive-manager",
        "senior-manager",
        "head-csr",
        "head-livelihood",
      ],
    };

    Axios.post("/api/auth/post/verify-otp-for-signup", formValues)
      .then((verifyOtpResponse) => {
        if (verifyOtpResponse) {
          if (verifyOtpResponse.data.message === "OTP Verified Successfully!") {
            Swal.fire(
              " ",
              "OTP Verified Successfully! Now you can reset your Password."
            ).then(() => {
              window.location.replace("/auth/reset-password");
            });
            // this.setState({ otpVerifyModal: true });
            // this.props.SetModalForm("resetPassword");
          } else {
            var msg = verifyOtpResponse.data.message;
            Swal.fire(" ", verifyOtpResponse.data.message);
            // this.setState({ errorModal: true, msg: msg });
          }
        }
      })
      .catch((error) => {
        var msg = "error while verifying otp";
        console.log("error while verifying otp==", error);
        // this.setState({ errorModal: true, msg: msg });
      });
  }

  render() {
    return (
      <section className="bg-white rounded shadow-md w-full max-w-sm m-10">
        <div className="w-full">
          <div className="w-full bg-lightgreen border border-2 border-t-green py-6 h-20">
            <h1 className=" text-xl md:text-2xl text-green font-bold leading-tight text-center">
              Verify OTP
            </h1>
          </div>
          {/* <p className='text-sm text-center px-5'>Please enter your registered email address below to receive an OTP.</p> */}
          <form className="m-4 space-y-4 lg:m-5 md:space-y-5" action="#">
            <div className="flex mx-auto justify-center w-full">
              <OtpInput
                value={this.state.otp}
                onChange={this.handleChange}
                name="otp"
                numInputs={4}
                isInputNum
                inputStyle={{
                  width: "50px",
                  height: "50px",
                  margin: "4px",
                  fontSize: "20px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  textAlign: "center",
                }}
                renderInput={(props) => <input {...props} />}
                focusStyle={{
                  outline: "none",
                  border: "1px solid #007bff",
                }}
              />
            </div>
            <div className="flex justify-center text-center mt-5">
              <span className="text-dark">
                {this.state.OTPresent ? (
                  <Countdown
                    date={Date.now() + 30000}
                    renderer={this.renderer}
                  />
                ) : (
                  <a
                    href=""
                    className="underline underline-offset-2 text-sm font-semibold inputLabel text-blue-500 hover:text-blue-700 focus:text-blue-800"
                    // className={
                    //   "flex items-center text-blue-700 hover:text-blue-900 cursor-pointer"
                    // }
                    onClick={this.resendOTP.bind(this)}
                  >
                    <span className="text-blue-500 hover:text-blue-700 focus:text-blue-800">
                      Resend OTP
                    </span>
                    <i className="bx bx-caret-right ml-1"></i>
                  </a>
                )}
              </span>
            </div>

            <div className="w-2/3 justify-center text-center mx-auto">
              <button
                type="submit"
                className="formButtons px-6"
                onClick={this.verifyOTP.bind(this)}
              >
                {this.state.loading2 ? (
                  <span
                    onClick={() => {
                      this.setState({ loading2: true });
                    }}
                    className="text-nowrap"
                  >
                    Verify OTP & Login
                    <FaSpinner className="animate-spin inline-flex mx-2 text-lg text-white text-center" />
                  </span>
                ) : (
                  "Verify OTP & Login"
                )}
              </button>
            </div>
            <div className="flex justify-center">
              <a
                href="/auth/login"
                // className="text-sm  justify-left text-blue-700 hover:text-blue-900 cursor-pointer"
                className="underline underline-offset-2 text-sm font-semibold inputLabel text-blue-500 hover:text-blue-700 focus:text-blue-800"
                onClick={() => {
                  this.setState({ loading: true });
                }}
              >
                {this.state.loading ? (
                  <span className="text-blue-500 hover:text-blue-700 focus:text-blue-800">
                    Back to Login
                    <FaSpinner className="animate-spin inline-flex mx-2 text-lg text-green text-center" />
                  </span>
                ) : (
                  <span className="text-blue-500 hover:text-blue-700 focus:text-blue-800">
                    Back to Login
                  </span>
                )}
              </a>
            </div>
          </form>
        </div>

        {/* <Modal
          show={this.state.otpSentModal}
          size="md"
          onClose={() => this.setState({ otpSentModal: false })}
          popup
        >
          <Modal.Header className="modalHeader justify-end">
            <div
              className="modalCloseButton"
              onClick={() => this.setState({ otpSentModal: false })}
            >
              <MdClose className="icon text-white font-medium" />
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="modalBody">
              <h3 className="modalText">
                OTP resent to your registered email address
              </h3>
              <div className="modelText">Please enter your New OTP</div>
              <div className="flex justify-center gap-4">
                <button
                  className="modalSuccessBtn"
                  onClick={() => this.setState({ otpSentModal: false })}
                >
                  Ok
                </button>
              </div>
            </div>
          </Modal.Body>
        </Modal>

        <Modal
          show={this.state.otpVerifyModal}
          size="md"
          onClose={() => this.setState({ otpVerifyModal: false })}
          popup
        >
          <Modal.Header className="modalHeader justify-end">
            <div
              className="modalCloseButton"
              onClick={() => this.setState({ otpVerifyModal: false })}
            >
              <MdClose className="icon text-white font-medium" />
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="modalBody">
              <h3 className="modalText">OTP verified successfully</h3>
              <div className="modelText">Now you can reset your password</div>
              <div className="flex justify-center gap-4">
                <button
                  className="modalSuccessBtn"
                  onClick={() => this.setState({ otpVerifyModal: false })}
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
              {this.state.msg ? (
                <h3 className="modalText">{this.state.msg}</h3>
              ) : (
                <>
                  <h3 className="modalText">Oops!</h3>
                  <div className="modalText">Something went wrong</div>
                </>
              )}
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
