/*==========================================================
  Developer  :  Priyanka Bhanvase
  Date       :  
  ------------------------------------
  Reviewed By:  
  Review Date: 
==========================================================*/
"use client";
import React, { Component } from "react";
import Axios from "axios";
// import { Validations } from '@/Templates/validations/validations.js';
import Swal from "sweetalert2";
import { Modal } from "flowbite-react";
import { MdClose } from "react-icons/md";

// import { GoogleLogin } from 'react-google-login-component';

class SignUp extends Component {
  constructor() {
    super();
    this.state = {
      firstname: "",
      lastname: "",
      email: "",
      mobNumber: "",
      pwd: "",
      confirmPass: "",
      username: "EMAIL",
      role: "user",
      errors: {
        firstname: "",
        lastname: "",
        email: "",
        mobNumber: "",
        pwd: "",
        confirmPass: "",
      },
      successModal: false,
      errorModal: false,
      msg: "",
    };
  }
  responseGoogle = (googleUser) => {
    var id_token = googleUser.getAuthResponse().id_token;
    var googleId = googleUser.getId();

    console.log({ googleId });
    console.log({ accessToken: id_token });
  };
  handleInputChangeInfo = (e) => {
    console.log("e.target.name => ", e.target.name);
    console.log("e.target.value => ", e.target.value);

    this.setState({
      [e.target.name]: e.target.value,
    });
    // let fields = this.state.fields;
    // fields[e.target.name] = e.target.value;
    // this.setState({ fields });
  };

  onlyAlphabets = (event) => {
    // console.log("event.which = ",event.which);
    if (
      (event.which >= 65 && event.which <= 90) ||
      (event.which >= 97 && event.which <= 122) ||
      event.which === 8 ||
      event.which === 9 ||
      event.which === 46 ||
      event.which === 37 ||
      event.which === 39
    ) {
      return true;
    } else {
      event.preventDefault();
    }
  };
  onlyEmail = (event) => {
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
  onlyNumbers = (event) => {
    if (
      (event.which >= 48 && event.which <= 57) ||
      event.which === 8 ||
      event.which === 9 ||
      event.which === 46 ||
      event.which === 37 ||
      event.which === 39
    ) {
      return true;
    } else {
      event.preventDefault();
    }
  };
  alphaNumeric = (event) => {
    // console.log("event.which = ",event.which);
    if (
      (event.which >= 65 && event.which <= 90) ||
      (event.which >= 97 && event.which <= 122) ||
      (event.which >= 48 && event.which <= 57) ||
      event.which === 8 ||
      event.which === 9 ||
      event.which === 46 ||
      event.which === 37 ||
      event.which === 39
    ) {
      return true;
    } else {
      event.preventDefault();
    }
  };
  togglePassword(event) {
    event.preventDefault();
    var id = event.currentTarget.id;
    var idArr = id.split("-");
    var inputId = idArr[1];
    // console.log("inputId", inputId)
    if (document.getElementById(id).classList.contains("fa-eye-slash")) {
      document.getElementById(id).classList.remove("fa-eye-slash");
      document.getElementById(id).classList.add("fa-eye");
    } else {
      document.getElementById(id).classList.remove("fa-eye");
      document.getElementById(id).classList.add("fa-eye-slash");
    }

    var input = document.getElementById(inputId);
    // console.log("input", input)
    if (input.getAttribute("type") === "password") {
      input.setAttribute("type", "text");
    } else {
      input.setAttribute("type", "password");
    }
  }
  validateForm = () => {
    let fields = this.state;
    let errors = {};
    let formIsValid = true;

    if (!fields["firstname"]) {
      formIsValid = false;
      errors["firstname"] = "This field is required.";
    }

    if (typeof fields["firstname"] !== "undefined") {
      var pattern = new RegExp(/^[A-Za-z]*$/);
      if (!pattern.test(fields["firstname"])) {
        formIsValid = false;
        errors["firstname"] = "Name should only contain letters.";
      } else {
        errors["firstname"] = "";
      }
    }

    if (!fields["lastname"]) {
      formIsValid = false;
      errors["lastname"] = "This field is required.";
    }

    if (typeof fields["lastname"] !== "undefined") {
      var pattern = new RegExp(/^[A-Za-z]*$/);
      if (!pattern.test(fields["lastname"])) {
        formIsValid = false;
        errors["lastname"] = "Name should only contain letters.";
      }
    }
    if (!fields["email"]) {
      formIsValid = false;
      errors["email"] = "This field is required.";
    }

    if (this.state.email !== "") {
      if (!fields["email"]) {
        formIsValid = false;
        errors["email"] = "Please enter your email.";
      }
    }
    if (!fields["firstname"]) {
      formIsValid = false;
      errors["firstname"] = "This field is required.";
    }

    if (typeof fields["email"] !== "undefined") {
      //regular expression for email validation
      var pattern = new RegExp(
        /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/
      );
      if (!pattern.test(fields["email"])) {
        formIsValid = false;
        errors["email"] = "Please enter valid email.";
      }
    }

    if (!fields["mobNumber"]) {
      formIsValid = false;
      errors["mobNumber"] = "This field is required.";
    } else {
      if (this.state.mobNumber.length < 10) {
        formIsValid = false;
        errors["mobNumber"] = "Mobile Number must be 10 digits!";
      }
    }
    if (typeof fields["pwd"] !== "undefined") {
      if (fields["pwd"].length >= 6) {
        var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        if (re.test(fields["pwd"])) {
          errors["pwd"] = "";
        } else if (/\s/.test(fields["pwd"])) {
          errors["pwd"] =
            "Password can not contain spaces, please remove all spaces!";
        } else {
          errors["pwd"] =
            "Must have min 1 Upper & 1 Lower Case letter, 1 Number & 1 Symbol";
        }
      } else {
        formIsValid = false;
        errors["pwd"] = "Min 6 characters required";
      }
    }
    if (!fields["confirmPass"]) {
      formIsValid = false;
      errors["confirmPass"] = "This field is required.";
    }

    if (typeof fields["confirmPass"] !== "undefined") {
      if (fields["pwd"] !== fields["confirmPass"]) {
        formIsValid = false;
        errors["confirmPass"] = "Password does not match";
      } else {
        errors["confirmPass"] = "";
      }
    }
    this.setState(
      {
        errors: errors,
      },
      () => {
        console.log("this.state.errors = ", this.state.errors);
      }
    );
    return formIsValid;
  };

  userSignupWithOtp = (event) => {
    event.preventDefault();
    if (this.validateForm()) {
      var formValues = {
        firstname: this.state.firstname,
        lastname: this.state.lastname,
        mobile: this.state.mobNumber,
        email: this.state.email,
        pwd: this.state.confirmPass,
        role: "user",
        status: "unverified",
        countryCode: "IN",
        isdCode: "91",
        username: "EMAIL",
        pincode: "",
        authService: "",
      };
      if (formValues) {
        // console.log("formValues==",formValues);
        this.setState({ btnLoading: true });

        Axios.post("/api/auth/post/signup/admin/otp", formValues)
          .then((signupResponse) => {
            console.log("signupResponse => ", signupResponse.data.message);
            this.setState({ btnLoading: false });

            if (signupResponse) {
              if (signupResponse.data.message === "USER__CREATED") {
                Swal.fire(
                  " ",
                  "Please Check your Email inbox <br/>" +
                    "We have sent verification code on your given email"
                );
                window.location.replace(
                  "/auth/otp-validation?username=" + this.state.email
                );
              } else {
                let msg = signupResponse.data.message;
                Swal.fire(" ", signupResponse.data.message);
              }
            }
          })
          .catch((error) => {
            this.setState({ btnLoading: false });
            let msg = error.message;
            console.log("getting error while signup user", error);
            Swal.fire(" ", error.message);
          });
      }
    }
  };

  render() {
    return (
      <section
        className={
          " w-full md:flex-row h-auto items-center " + this.props.bgColor
        }
      >
        <div className={"formWrapper " + this.props.style}>
          <div className="w-full bg-white rounded-lg  dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="px-1 pb-8 pt-0 space-y-4 sm:p-1 md:space-y-6">
              <h1 className="text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Sign Up
              </h1>
              <form className="space-y-4 md:space-y-6">
                <div className="flex flex-row">
                  <div className=" mr-3">
                    <label className="label">First Name :</label>
                    <div className=" relative">
                      <label
                        htmlFor="hs-hero-name-2"
                        className="block text-sm font-medium dark:text-white"
                      >
                        <span className="sr-only">First Name</span>
                      </label>
                      <div className="insideIcon">
                        <i className="fa-regular fa-user w-5 h-5 mr-16"></i>
                      </div>
                      <input
                        type="text"
                        id="firstname"
                        name="firstname"
                        className="stdInput2"
                        value={this.state.firstname}
                        placeholder="First Name"
                        onKeyDown={this.onlyAlphabets}
                        onChange={this.handleInputChangeInfo}
                        autoFocus
                        autoComplete="true"
                        // required
                      />
                    </div>
                    <div className=" text-left pl-0 errorMsg mt-1">
                      {this.state.errors.firstname}
                    </div>
                  </div>
                  <div className="">
                    <label className="label">Last Name :</label>
                    <div className=" relative">
                      <label
                        htmlFor="hs-hero-name-2"
                        className="block text-sm font-medium dark:text-white"
                      >
                        <span className="sr-only">Last Name</span>
                      </label>
                      <div className="insideIcon">
                        <i className="fa-regular fa-user w-5 h-5 mr-16"></i>
                      </div>
                      <input
                        type="text"
                        id="lastname"
                        name="lastname"
                        className="stdInput2"
                        value={this.state.lastname}
                        placeholder="Last Name"
                        onKeyDown={this.onlyAlphabets}
                        onChange={this.handleInputChangeInfo}
                        autoFocus
                        autoComplete="true"
                        required
                      />
                    </div>
                    <div className=" text-left pl-0 errorMsg mt-1">
                      {this.state.errors.lastname}
                    </div>
                  </div>
                </div>
                <div className="">
                  <label className="label">Email ID :</label>
                  <div className="mb-4 relative">
                    <label
                      htmlFor="Email ID"
                      className="block text-sm font-medium dark:text-white"
                    >
                      <span className="sr-only">Email ID</span>
                    </label>
                    <div className="insideIcon">
                      <i className="fa-regular fa-envelope w-5 h-5 mr-16"></i>
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      placeholder="Email ID"
                      className="stdInput2"
                      value={this.state.email}
                      onKeyDown={this.onlyEmail}
                      onChange={this.handleInputChangeInfo}
                      autoFocus
                      autoComplete="true"
                      required
                    />
                  </div>
                  <div className=" text-left pl-0 errorMsg mt-1">
                    {this.state.errors.email}
                  </div>
                </div>
                <div className="">
                  <label className="label">Mobile Number :</label>
                  <div className="mb-4 relative">
                    <label
                      htmlFor="Mobile Number"
                      className="block text-sm font-medium dark:text-white"
                    >
                      <span className="sr-only">Mobile Number</span>
                    </label>
                    <div className="insideIcon">
                      <i className="fa fa-phone w-5 h-5 mr-16"></i>
                    </div>
                    <input
                      type="number"
                      name="mobNumber"
                      id="mobNumber"
                      maxLength="10"
                      placeholder="10 Digit Mobile Number"
                      className="stdInput2"
                      value={this.state.mobNumber}
                      onKeyDown={this.onlyNumbers}
                      onChange={this.handleInputChangeInfo}
                      autoFocus
                      autoComplete="true"
                      required
                    />
                  </div>
                  <div className=" text-left pl-0 errorMsg mt-1">
                    {this.state.errors.mobNumber}
                  </div>
                </div>
                <div className="">
                  <label className="label">Password :</label>
                  <div className="mb-4 relative">
                    <label
                      htmlFor="Password"
                      className="block text-sm font-medium dark:text-white"
                    >
                      <span className="sr-only">Password</span>
                    </label>
                    <div className="insideIcon">
                      <i className="fa fa-lock w-5 h-5 mr-16"></i>
                    </div>
                    <input
                      type="password"
                      name="pwd"
                      id="pwd"
                      placeholder="Password"
                      className="stdInput2"
                      value={this.state.pwd}
                      onChange={this.handleInputChangeInfo}
                      autoFocus
                      autoComplete="true"
                      required
                    />
                    <span
                      id="id-pwd"
                      onClick={this.togglePassword.bind(this)}
                      className={
                        "fa fa-eye-slash toggleEye absolute right-5 top-3"
                      }
                    ></span>
                  </div>
                  <div className=" text-left pl-0 errorMsg mt-1">
                    {this.state.errors.pwd}
                  </div>
                </div>
                <div className="">
                  <label className="label">Confirm Password :</label>
                  <div className="mb-4 relative">
                    <label
                      htmlFor="Password"
                      className="block text-sm font-medium dark:text-white"
                    >
                      <span className="sr-only">Confirm Password :</span>
                    </label>
                    <div className="insideIcon">
                      <i className="fa fa-lock w-5 h-5 mr-16"></i>
                    </div>
                    <input
                      type="password"
                      name="confirmPass"
                      id="confirmPass"
                      placeholder="Confirm Password"
                      className="stdInput2"
                      value={this.state.confirmPass}
                      onChange={this.handleInputChangeInfo}
                      autoFocus
                      autoComplete="true"
                      required
                    />
                    <span
                      id="id-confirmPass"
                      onClick={this.togglePassword.bind(this)}
                      className={
                        "fa fa-eye-slash toggleEye absolute right-5 top-3"
                      }
                    ></span>
                  </div>
                  <div className=" text-left pl-0 errorMsg mt-1">
                    {this.state.errors.confirmPass}
                  </div>
                </div>

                {this.state.btnLoading ? (
                  <button type="submit" className="stdBtn bg-green-500">
                    <span>
                      <i className="fa fa-spin fa-spinner"></i>
                    </span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="stdBtn bg-green-600"
                    onClick={this.userSignupWithOtp}
                  >
                    Sign Up
                  </button>
                )}

                {/* <hr className="my-6 border-gray-300 w-full"/>
							<button type="button" className="w-full block bg-white hover:bg-gray-100 focus:bg-gray-100 text-gray-900 font-semibold rounded-lg px-4 py-3 border border-gray-300">
								<div className="flex items-center justify-center">
									<GoogleLogin socialId="yourClientID"
										className="google-login"
										scope="profile"
										fetchBasicProfile={false}
										responseHandler={responseGoogle}
										buttonText="Login With Google"/>
									</div>
							</button> */}
              </form>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default SignUp;
