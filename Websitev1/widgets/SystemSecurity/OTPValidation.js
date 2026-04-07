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

class ConfirmOTP extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userID: "",
      otp: "",
      OTPresent: false,
      countdown: 0,
      otpSentModal: false,
      otpVerifyModal: false,
      accSuccessModal: false,
      errorModal: false,
      msg: "",
    };
  }
  componentDidMount() {
    var url = window.location.href.split("=");
    var DecodedUrl = decodeURIComponent(url[1]);
    // console.log(decodeURIComponent(url));
    this.setState({
      userName: DecodedUrl,
    });
  }
  handleChange = (otp) => this.setState({ otp });

  renderer = ({ hours, minutes, seconds, completed }) => {
    if (completed) {
      this.setState({ OTPresent: false });
      // Render a completed state
      return <span>You are good to go!</span>;
    } else {
      // Render a countdown
      return (
        <span>
          {" "}
          <span className="text-primary">Resent OTP</span> after{" "}
          <span className="text-primary">{seconds}</span> seconds
        </span>
      );
    }
  };
  resendOTP = (event) => {
    event.preventDefault();
    if (this.state.userName) {
      this.setState({ otp: "" });
      var formValues = {
        userName: this.state.userName.toLowerCase(),
        role: [
          "admin",
          "center-incharge",
          "executive-manager",
          "senior-manager",
          "head-csr",
          "head-livelihood",
        ],
      };
      Axios.post("/api/auth/patch/send-otp-using-username", formValues)
        .then((otpResponse) => {
          if (otpResponse) {
            this.setState({ otp: "", OTPresent: true });
            // startCountDown();
            Swal.fire(
              " ",
              "New OTP resent to your email address <br/>" +
                "Please Enter your new OTP"
            );
            // this.setState({ otpSentModal: true });
          }
        })
        .catch((error) => {
          let msg = "error while resending otp";
          console.log("error while resending otp==", error);
          // this.setState({ otpSentModal: true, msg: msg });
        });
    }
  };
  verifyOTP = (event) => {
    event.preventDefault();
    var formValues = {
      userName: this.state.userName,
      OTP: this.state.otp,
      role: ["admin"],
    };

    Axios.post("/api/auth/post/verify-otp-for-signup", formValues)
      .then((verifyOtpResponse) => {
        if (verifyOtpResponse) {
          if (verifyOtpResponse.data.message === "OTP Verified Successfully!") {
            if (this.props.password === "") {
              Swal(
                " ",
                "Your email is verified successfully! <br/>" +
                  "You have to Login with your registered email and password"
              );
              // this.setState({ otpVerifyModal: true });
              // this.props.SetModalForm("login");
            } else {
              Swal.fire(
                " ",
                "Your Account is Created Successfully! <br/>" +
                  "Welcome to Website"
              )
                // Swal.fire(
                //   " ",
                //   "Your Account is Created Successfully! <br/>" +
                //     "Now you can login using your Email or Phone Number."
                // );
                // this.props.SetModalForm("login");
                .then(() => {
                  window.location.assign("/auth/login");
                });

              // var payload = {
              //     username : this.state.userName.toLowerCase(),
              //     password : this.state.password,
              //     role     : "user",
              //     event    : "Signup"
              // }
              // console.log("payload => ", payload);

              // Axios.post('/api/auth/post/login/mob_email_new', payload)
              //     .then(async (response) => {
              //         if (response.data.message === "Login Auth Successful") {
              //             if (response.data.userDetails) {
              //                 var userDetails = {
              //                     firstName: response.data.userDetails.firstName ? response.data.userDetails.firstName : "-NA-",
              //                     lastName: response.data.userDetails.lastName ? response.data.userDetails.lastName : "-NA-",
              //                     company_id: response.data.userDetails.company_id,
              //                     email: response.data.userDetails.email.toLowerCase(),
              //                     mobile: response.data.userDetails.mobile,
              //                     pincode: response.data.userDetails.pincode,
              //                     user_id: response.data.userDetails?.user_id,
              //                     roles: response.data.userDetails.roles,
              //                     token: response.data.userDetails.token,
              //                     authService: "",
              //                     isProfileReady: response.data.userDetails.isProfileReady ? response.data.userDetails.invitedConsultant : "",
              //                 }
              //                 localStorage.setItem('userDetails', JSON.stringify(userDetails));
              //                 this.props.SetUserLoggedIn();

              //                 this.setState({
              //                     loggedIn: true
              //                 }, () => {
              //                     // Swal.fire("response.data.userDetails.invitedConsultant => ",response.data.userDetails.invitedConsultant, " <br/> response.data.userDetails.joinAsConsultant => ",response.data.userDetails.joinAsConsultant);
              //                     window.location.assign("/login");
              //                     if (response.data.userDetails.isProfileReady) {
              //                         window.location.href = "/login";
              //                         window.location.assign("/login");
              //                     } else {
              //                         window.location.reload();
              //                     }
              //                 })
              //             }
              //         } else {
              //             new Swal("Something went wrong!", "Login process error", "error");
              //         }
              //     })
              //     .catch((error) => {
              //         console.log("error while login user=", error);
              //     });
            }
          } else {
            let msg = verifyOtpResponse.data.message;
            new Swal(
              " ",
              verifyOtpResponse.data.message + "<br/>" + "Try Again!"
            );
            // this.setState({ errorModal: true, msg: msg });
          }
        }
      })
      .catch((error) => {
        let msg = "Error while veriffying OTP";
        console.log("error while verifying otp==", error);
        // this.setState({ errorModal: true, msg: msg });
      });
  };
  render() {
    return (
      <section
        className={
          " w-full mx-auto md:flex-row h-auto items-center  my-10 " +
          this.props.bgColor
        }
      >
        <div className={"formWrapper " + this.props.style}>
          <a
            href="#"
            className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
          >
            {/* <img className="w-46 h-14  mr-2 xxl:w-46 xxl:h-16" src={"this.props.logo"} alt="logo" /> */}
          </a>
          {/* <div className="bg-white w-full md:max-w-md lg:max-w-full h-screen md:mx-0 md:w-1/2 xl:w-2/6 px-6 lg:px-16 xl:px-12
                            flex items-center justify-center"> */}
          <div className="w-full h-100">
            <h2 className="mb-1 text-xl font-bold leading-tight text-center tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Verify OTP
            </h2>
            <form className="mt-4 space-y-4 lg:mt-5 md:space-y-5" action="#">
              <div className="w-52 mx-auto justify-content-center otpInputBox">
                {/* <OtpInput
                  id=""
                  className="w-10 border "
                  value={this.state.otp}
                  onChange={this.handleChange}
                  numInputs={4}
                  name="otp"
                  // separator={<span>&nbsp;&nbsp;&nbsp;&nbsp;</span>}
                  // renderSeparator={<span>-</span>}
                  renderInput={(props) => <input {...props} />}
                /> */}
                <OtpInput
                  value={this.state.otp}
                  onChange={this.handleChange}
                  name="otp"
                  numInputs={4} // Specify the number of OTP input fields
                  isInputNum // Whether input should be numbers only (default is false)
                  inputStyle={{
                    // Style for each OTP input field
                    width: "40px",
                    height: "40px",
                    margin: "4px",
                    fontSize: "20px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    textAlign: "center",
                  }}
                  renderInput={(props) => <input {...props} />}
                  focusStyle={{
                    // Style for focused OTP input field
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
                      className={
                        "flex items-center text-blue-700 hover:text-blue-900 cursor-pointer"
                      }
                      onClick={this.resendOTP.bind(this)}
                    >
                      <span>Resend OTP</span>
                      <i className="bx bx-caret-right ml-1"></i>
                    </a>
                  )}
                </span>
              </div>
              <div className="w-2/3 justify-center text-center mx-auto">
                <button
                  type="submit"
                  className="stdBtn bg-blue-600"
                  onClick={this.verifyOTP.bind(this)}
                >
                  Verify OTP & Login
                </button>
              </div>
              <div className="text-left mx-2">
                <a
                  href="/auth/login"
                  className="font-light text-xs justify-left"
                >
                  Back to Login
                </a>
              </div>
            </form>
          </div>
          {/* </div> */}
        </div>
      </section>
    );
  }
}

export default ConfirmOTP;
