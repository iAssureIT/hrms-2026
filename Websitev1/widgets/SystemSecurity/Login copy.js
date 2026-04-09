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
import Swal from "sweetalert2";
import validator from "validator";

class Login extends Component {
  constructor() {
    super();
    this.state = {
      btnLoading: false,
      loggedIn: false,
      auth: {
        email: "",
        pwd: "",
      },
      email: "",
      password: "",
      fields: {},
      errors: {},
    };
  }

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
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }
  togglePassword(event) {
    event.preventDefault();
    var id = event.currentTarget.id;
    var idArr = id.split("-");
    var inputId = idArr[1];

    if (document.getElementById(id).classList.contains("fa-eye-slash")) {
      document.getElementById(id).classList.remove("fa-eye-slash");
      document.getElementById(id).classList.add("fa-eye");
    } else {
      document.getElementById(id).classList.remove("fa-eye");
      document.getElementById(id).classList.add("fa-eye-slash");
    }

    var input = document.getElementById(inputId);
    if (input.getAttribute("type") === "password") {
      input.setAttribute("type", "text");
    } else {
      input.setAttribute("type", "password");
    }
  }
  validateForm() {
    let fields = this.state;
    let errors = {};
    let formIsValid = true;
    var tempEmail = this.state.fields?.email?.trim(); // value of field with whitespace trimmed off
    var emailFilter = /^[^@]+@[^@.]+\.[^@]*\w\w$/;
    var illegalChars = /[()<>,;:\\"[\]]/;

    if (!fields["email"]) {
      formIsValid = false;
      errors["email"] = "This field is mandatory.";
    } else if (!emailFilter.test(tempEmail)) {
      //test email for illegal characters
      fields["email"].innerHTML = "Please enter a valid email address.";
      formIsValid = false;
    } else if (this.state.email.match(illegalChars)) {
      document.getElementById("emailError1").innerHTML =
        "Email contains invalid characters.";
      formIsValid = false;
    }

    if (!fields["password"]) {
      formIsValid = false;
      errors["password"] = "This field is mandatory.";
    }

    this.setState({
      errors: errors,
    });
    return formIsValid;
  }
  userlogin(event) {
    event.preventDefault();
    var formValues = {
      email: this.state.email,
      password: this.state.password,
      role: ["admin", "fa-accounts"],
      // role: ["user",'admin'],
    };
    console.log("formValues", formValues);
    if (this.validateForm()) {
      Axios.post("/api/auth/post/login", formValues)
        .then(async (response) => {
          console.log("response", response);
          // alert("login response => ", JSON.stringify(response));
          if (response.data.message === "Login Auth Successful") {
            if (response.data.userDetails) {
              var userDetails = {
                firstName: response.data.userDetails.firstName
                  ? response.data.userDetails.firstName
                  : "-NA-",
                lastName: response.data.userDetails.lastName
                  ? response.data.userDetails.lastName
                  : "-NA-",
                company_id: response.data.userDetails.company_id
                  ? response.data.userDetails.company_id
                  : "-",
                email: response.data.userDetails.email,
                mobile: response.data.userDetails.mobile,
                pincode: response.data.userDetails.pincode,
                user_id: response.data.userDetails?.user_id,
                roles: response.data.userDetails.roles,
                token: response.data.userDetails.token,
                authService: "",
              };
              localStorage.setItem("userDetails", JSON.stringify(userDetails));
              // this.props.SetUserLoggedIn();
              new Swal("Login successful", "", "success");
              window.location.replace("/admin/dashboard");

              this.setState(
                {
                  loggedIn: true,
                },
                () => {
                  console.log(
                    "response.data.userDetails => ",
                    response.data.userDetails
                  );
                }
              );
            }
          } else {
            if (response.data.message === "INVALID_PASSWORD") {
              new Swal("Your password is wrong", "", "error");
            } else if (response.data.message === "NOT_REGISTER") {
              new Swal(
                "Not a User Already!",
                "Please fill in correct Email Address/Mobile Number or Proceed to Sign Up",
                "error"
              );
            } else if (response.data.message === "USER_UNVERIFIED") {
              new Swal(
                "This email is not yet verified",
                "Please click on 'Verify Email' link on Login form to verify your account",
                "error"
              );
            } else if (response.data.message === "USER_BLOCK") {
              new Swal(
                "User is blocked",
                "You have attempted 5 wrong password attemps. Please contact Super admin",
                "error"
              );
            } else {
              new Swal(response.data.message);
            }
          }
        })
        .catch((error) => {
          console.log("error while login user=", error);
          Swal.fire(error.message, "", "error");
        });
    }
  }
  render() {
    return (
      <section
        className={
          " w-full md:flex-row h-auto items-center  my-10 " + this.props.bgColor
        }
      >
        <div className={"formWrapper " + this.props.style}>
          <a
            href="#"
            className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
          >
            {/* <img className="w-46 h-14  mr-2 xxl:w-46 xxl:h-16" src={this.props.logo} alt="logo" /> */}
          </a>
          <div className="w-full h-100">
            <h1 className="text-xl md:text-2xl font-bold leading-tight text-center">
              Log in to your account
            </h1>
            <form className="mt-6" action="#" method="POST">
              {/* <div>
                                <label className="block text-gray-700">Email Address</label>
                                <input type="email" name="" id="email" placeholder="Enter Email Address" className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-green-500 focus:bg-white focus:outline-none" autofocus autocomplete required/>
                            </div> */}
              <div className="space-y-2 md:space-y-2 mb-4">
                <label className="label">Email ID:</label>
                <div className="mb-4 relative">
                  <label
                    htmlFor="Email ID"
                    className="block text-sm font-medium dark:text-white"
                  >
                    <span className="sr-only">Email ID</span>
                  </label>
                  <div className="insideIcon">
                    <i className="fa-regular fa-envelope mr-16"></i>
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Email ID"
                    className="stdInput2"
                    onChange={this.handleChange.bind(this)}
                    value={this.state.email}
                    onKeyDown={this.onlyEmail.bind(this)}
                    autoFocus
                    autoComplete
                    required
                  />
                </div>
                <div className=" text-left pl-0 errorMsg mt-1">
                  {this.state.errors.email}
                </div>
              </div>
              <div className="">
                <label className="label">Password:</label>
                <div className="mb-4 relative">
                  <label
                    htmlFor="Password"
                    className="block text-sm font-medium dark:text-white"
                  >
                    <span className="sr-only">Password</span>
                  </label>
                  <div className="insideIcon">
                    <i className="fa fa-lock mr-16"></i>
                  </div>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Password"
                    className="stdInput2"
                    onChange={this.handleChange.bind(this)}
                    value={this.state.password}
                    autoFocus
                    autoComplete
                    required
                  />
                  <span
                    id="id-password"
                    onClick={this.togglePassword.bind(this)}
                    className={
                      "fa fa-eye-slash toggleEye absolute top-4 right-4"
                    }
                  ></span>
                </div>
                <div className=" text-left pl-0 errorMsg mt-1">
                  {this.state.errors.password}
                </div>
              </div>
              {/* <div className="mt-4">
                                <label className="block text-gray-700">Password</label>
                                <input type="password" name="" id="password" placeholder="Enter Password" minlength="6" className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-green-500
                                        focus:bg-white focus:outline-none" required />
                            </div> */}
              <div className="text-right mt-2">
                <a
                  href="/auth/forgot-password"
                  className="text-sm font-semibold text-[#007bff] hover:text-green-700 focus:text-green-700"
                >
                  Forgot Password?
                </a>
              </div>
              <button
                type="submit"
                onClick={this.userlogin.bind(this)}
                disabled={this.state.loggedIn}
                className={`
                  stdBtn 
                  bg-green-600 
                  mt-4
                  relative 
                  transition-all 
                  ${this.state.loggedIn ? "p-6" : " "}
                `}
              >
                {/* ${isClicked ? 'cursor-not-allowed opacity-50' : ' '} */}

                {this.state.loggedIn ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6  border-t-2 border-b-2 border-white"></div>
                  </div>
                ) : (
                  "Log In"
                )}
              </button>
            </form>

            {/* if signup provided */}
            {/* <hr className="my-3 border-gray-300 w-full" />
            <p className="mt-3">Need an account?
                <a href="/auth/signup" className="text-green-500 hover:text-green-700 font-semibold">
                    &nbsp; Create an account
                </a>
            </p> */}
          </div>
        </div>
      </section>
    );
  }
}

export default Login;
