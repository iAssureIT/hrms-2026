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
import { Modal } from "flowbite-react";
import { MdClose } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";

class ResetPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      btnLoading: false,
      email: "",
      newPassword: "",
      confirmPassword: "",
      showMessage: false,
      errors: {},
      fields: {},
      showPassword: false,
      successModal: false,
      errorModal: false,
      msg: "",
      loading: false,
    };
  }
  // const [showPassword, setShowPassword] = useState(false);

  togglePassword(event) {
    event.preventDefault();
    var id = event.currentTarget.id;
    var idArr = id.split("-");
    var inputId = idArr[1];
    //console.log("inputId", inputId, event.currentTarget.id);
    if (document.getElementById(id).classList.contains("fa-eye-slash")) {
      document.getElementById(id).classList.remove("fa-eye-slash");
      document.getElementById(id).classList.add("fa-eye");
    } else {
      document.getElementById(id).classList.remove("fa-eye");
      document.getElementById(id).classList.add("fa-eye-slash");
    }

    var input = document.getElementById(inputId);
    //console.log("input", input);
    if (input.getAttribute("type") === "password") {
      input.setAttribute("type", "text");
    } else {
      input.setAttribute("type", "password");
    }
  }

  validateForm() {
    let fields = this.state.fields;
    let errors = {};
    let formIsValid = true;

    if (!fields["email"]) {
      formIsValid = false;
      errors["email"] = "This field is required.";
    }
    if (!fields["newPassword"]) {
      formIsValid = false;
      errors["newPassword"] = "This field is required.";
    }

    if (typeof fields["newPassword"] !== "undefined") {
      if (fields["newPassword"].length >= 6) {
        var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        if (re.test(fields["newPassword"])) {
          errors["newPassword"] = "";
        } else {
          errors["newPassword"] =
            "Must have min 1 Upper & 1 Lower Case letter, 1 Number & 1 Symbol";
        }
      } else {
        formIsValid = false;
        errors["newPassword"] = "Min 6 characters required";
      }
    }

    if (!fields["confirmPassword"]) {
      formIsValid = false;
      errors["confirmPassword"] = "This field is required.";
    }

    if (typeof fields["confirmPassword"] !== "undefined") {
      if (fields["newPassword"] !== fields["confirmPassword"]) {
        formIsValid = false;
        errors["confirmPassword"] = "Password does not match";
      } else {
        errors["confirmPassword"] = "";
      }
    }
    this.setState(
      {
        errors: errors,
      },
      () => {
        console.log("this.state.errors = ", this.state.errors);
      },
    );

    return formIsValid;
  }
  resetPassword(event) {
    event.preventDefault();

    // if (this.validateForm()) {
    var formValues = {
      userName: this.state.email,
      pwd: this.state.fields["newPassword"],
    };

    this.setState({ btnLoading: true });
    Axios.patch("/api/auth/patch/change-password-using-username", formValues)
      .then((response) => {
        this.setState({ btnLoading: false });

        if (response.data.message === "Password Changed successfully!") {
          this.setState({
            showMessage: true,
          });
          Swal.fire(
            " ",
            "Password changed successfully <br/>",
            "Use new password to Login!",
          ).then(() => {
            window.location.href = "/auth/login";
            window.location.assign("/auth/login");
          });
        } else {
          let msg = response.data.message;
          Swal.fire(" ", response.data.message);
        }
      })
      .catch((error) => {
        this.setState({ btnLoading: false });
        console.log("reset Password error=", error);
      });

    // }
  }

  handleChange(event) {
    let fields = this.state.fields;
    fields[event.target.name] = event.target.value;
    this.setState({
      fields: fields,
      [event.target.name]: event.target.value,
    });
  }
  render() {
    return (
      <section className="bg-white rounded shadow-md w-full max-w-sm max-h-[80dvh] overflow-y-auto">
        <div className="w-full">
          <div className="w-full bg-[#f8fafc] border-t-4 border-[#3c8dbc] py-6 shadow-sm">
            <h1 className=" text-xl md:text-2xl text-[#3c8dbc] font-black leading-tight text-center tracking-tight">
               Reset Password
            </h1>
          </div>
          <form className="mt-2 p-4" action="#" method="POST">
            <div className="mb-2 relative">
              <label className="block inputLabel font-semibold mb-1">
                Email :
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Email ID"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg pl-10 ring-1 ring-inset ring-slate-100 focus:ring-2 focus:ring-inset focus:ring-[#3c8dbc] border-none outline-none transition-all"
                  value={this.state.email}
                  onChange={this.handleChange.bind(this)}
                  autoFocus
                  autoComplete="on"
                  required
                />
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <i className="fa-regular fa-envelope"></i>
                </span>
              </div>
            </div>
            <div className="mb-2 relative">
              <label className="block inputLabel font-semibold mb-1">
                New Password :
              </label>
              <div className="relative">
                <input
                  type={this.state.showPassword ? "text" : "password"}
                  name="newPassword"
                  id="newPassword"
                  placeholder="Password"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg pl-10 ring-1 ring-inset ring-slate-100 focus:ring-2 focus:ring-inset focus:ring-[#3c8dbc] border-none outline-none transition-all"
                  value={this.state.newPassword}
                  onChange={this.handleChange.bind(this)}
                  autoComplete="on"
                  required
                />
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <i className="fa fa-lock"></i>
                </span>
                <span
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 cursor-pointer"
                  onClick={() =>
                    this.setState({ showPassword: !this.state.showPassword })
                  }
                >
                  {this.state.showPassword ? (
                    <span
                      id="id-newPassword"
                      className={
                        "fa fa-eye toggleEye absolute top-3 text-gray-400 right-4"
                      }
                    ></span>
                  ) : (
                    <span
                      id="id-newPassword"
                      className={
                        "fa fa-eye-slash toggleEye absolute top-3 text-gray-400 right-4"
                      }
                    ></span>
                  )}
                </span>
              </div>
            </div>
            <div className="mb-2 relative">
              <label className="block inputLabel font-semibold mb-1">
                Confirm Password :
              </label>
              <div className="relative">
                <input
                  type={this.state.showPassword ? "text" : "password"}
                  name="confirmPassword"
                  id="confirmPassword"
                  placeholder="Password"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg pl-10 ring-1 ring-inset ring-slate-100 focus:ring-2 focus:ring-inset focus:ring-[#3c8dbc] border-none outline-none transition-all"
                  value={this.state.confirmPassword}
                  onChange={this.handleChange.bind(this)}
                  autoComplete="on"
                  required
                />
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <i className="fa fa-lock"></i>
                </span>
                <span
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 cursor-pointer"
                  onClick={() =>
                    this.setState({ showPassword: !this.state.showPassword })
                  }
                >
                  {this.state.showPassword ? (
                    <span
                      id="id-confirmPassword"
                      className={
                        "fa fa-eye toggleEye absolute top-3 text-gray-400 right-4"
                      }
                    ></span>
                  ) : (
                    <span
                      id="id-confirmPassword"
                      className={
                        "fa fa-eye-slash toggleEye absolute top-3 text-gray-400 right-4"
                      }
                    ></span>
                  )}
                </span>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                className="formButtons w-full sm:w-auto mt-2"
                onClick={this.resetPassword.bind(this)}
              >
                {this.state.loading ? (
                  <span
                    onClick={() => {
                      this.setState({ loading: true });
                    }}
                    className="text-nowrap"
                  >
                    Reset Password
                    <FaSpinner className="animate-spin inline-flex mx-2 text-lg text-white text-center" />
                  </span>
                ) : (
                  "Reset Password"
                )}
              </button>
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
              <h3 className="modalText">Password changed successfully</h3>
              <div className="modelText">Use new password to login!</div>
              <div className="flex justify-center gap-4">
                <button
                  className="modalSuccessBtn"
                  onClick={() => this.setState({ successModal: false })}
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
                <div className="modelText">Something went wrong!</div>
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

export default ResetPassword;
