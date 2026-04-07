"use client";
import { Button } from "@material-tailwind/react";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import { useParams } from "next/navigation";
import { Modal } from "flowbite-react";
import { MdClose } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";
import validator from "validator";

// import {
//   Image,
//   ImageCaption,
//   ImageStyle,
//   ImageToolbar,
//   ImageUpload
// } from '@ckeditor/ckeditor5-image';

function AddTemplate() {
  // Getting the EVENTS string from publicRuntimeConfig
  // const eventsArray = process.env.EVENTS;

  // const eventsString = process.env.EVENTS;
  // // Splitting the EVENTS string into an array
  // const eventsArray = eventsString?.split(",")?.map((event) => event?.trim());
  const eventsArray = [
    { event: "Approval Management - Create Approval", count: 0 },
    { event: "Approval Management - Approval Status Approved", count: 0 },
    { event: "Approval Management - Approval Status Rejected", count: 0 },
    { event: "Approval Management - Inform Authourity - Approval Action", count: 0 }, //Inform Authourity
    { event: "Approval Management - Inform Applicant - Approval Action", count: 0 },

    { event: "Approval Management - Inform Applicant - Approval Activity All Level Approved", count: 0 },
    { event: "Approval Management - Inform Applicant - Approval Activity All Level Rejected", count: 0 },
    { event: "Approval Management - Inform Authourities - Approval Activity All Level Approved", count: 0 },
    { event: "Approval Management - Inform Authourities - Approval Activity All Level Rejected", count: 0 },

    { event: "Utilization Management - Create Utilization Approval", count: 0 },
    { event: "Utilization Management - Inform Applicant - Utilization All Level Approved", count: 0 },
    { event: "Utilization Management - Inform Applicant - Utilization All Level Rejected", count: 0 },

    { event: "Utilization Management - Inform Authourities - Utilization All Level Rejected", count: 0 },
    { event: "Utilization Management - Inform Authourities - Utilization All Level Approved", count: 0 },
    
    { event: "Utilization Management - Utilization Approval Status Approved", count: 0 },
    { event: "Utilization Management - Utilization Approval Status Rejected", count: 0 },

    { event: "Utilization Management - Inform Authourity for Utilization Approval", count: 0 },
    { event: "Utilization Management - Inform Applicant - Utilization Approval Action", count: 0 },

    { event: "Utilization Management - Inform Finance Manager - Utilization All Level Approved", count: 0 },
    { event: "Utilization Management - Inform Account Person - Utilization All Level Approved", count: 0 },

    { event: "User Management - Create User", count: 0 },
    { event: "User Management - Edit User", count: 0 },
    { event: "User Management - User Activated", count: 0 },
    { event: "User Management - User Inactivated", count: 0 },
    
    { event: "System Security - Forgot Password OTP", count: 0 },
    { event: "System Security - Reset Password Successful", count: 0 },
  ].sort((a, b) => {
    return a.event.localeCompare(b.event);
  });
  // console.log(eventsArray); // This will output an array of events
  const [openTab, setOpenTab] = useState(1);
  const [openTemplateTypeTab, setOpenTemplateTypeTab] = useState(1);
  const [roleList, setRoleList] = useState([]);
  const [eventList, setEventList] = useState(eventsArray);
  // const [eventList, setEventList] = useState([]);
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [templateType, setTemplateType] = useState("");
  const [event, setEvent] = useState("");
  const [role, setRole] = useState("");
  const [user_id, setUser_id] = useState("");

  const [messageCount, setMessageCount] = useState(0);
  const smsMaxLength = 150;
  const whatsappMaxLength = 1024;
  const [emailCount, setEmailCount] = useState("0");
  const [smsCount, setSMSCount] = useState("0");
  const [inappCount, setINAPPCount] = useState("0");
  const [whatsappCount, setWHATSAPPCount] = useState("0");

  const [msg, setMsg] = useState("");
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [error, setError] = useState({});
  const [warning, setWarning] = useState(null);
  const [loading, setLoading] = useState(false);

  const params = useParams();

  const button = params?._id ? "Update" : "Submit";

  // const schema = yup.object().shape({
  //   // message: yup.string().required('This field is required'),
  //   templateType: yup.string().required("This field is required"),
  //   role: yup.string().required("This field is required"),
  //   event: yup.string().required("This field is required"),
  //   subject: yup.string().required("This field is required"),
  // });

  const editorRef = useRef();
  const [editorLoaded, setEditorLoaded] = useState(false);
  const { CKEditor, ClassicEditor } = editorRef.current || {};

  // const {
  //   register,
  //   handleSubmit,
  //   watch,
  //   reset,
  //   clearErrors,
  //   formState: { errors },
  // } = useForm({
  //   resolver: yupResolver(schema),
  // });
  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const userDetailsParse = JSON.parse(userDetails);
      const parseUser_id = userDetailsParse.user_id;
      setUser_id(parseUser_id);
    }
  }, []);
  useEffect(() => {
    const loadEditor = async () => {
      try {
        const { CKEditor } = await import("@ckeditor/ckeditor5-react");
        const { default: ClassicEditor } = await import(
          "@ckeditor/ckeditor5-build-classic"
        );
        const editor = {
          CKEditor,
          ClassicEditor,
        };
        editorRef.current = editor;

        setEditorLoaded(true);
      } catch (error) {
        console.error("Failed to load editor:", error);
      }
    };
    fetchCountTypewise();
    loadEditor();
    getRoleList();
  }, []);

  const fetchCountTypewise = async () => {
    try {
      const response = await axios.get(
        "/api/masternotifications/get/countByType"
      );
      response.data.map((type, index) => {
        // console.log("res.data", type);
        if (type.type === "EMAIL") {
          setEmailCount(type.count);
        }
        if (type.type === "SMS") {
          setSMSCount(type.count);
        }
        if (type.type === "INAPP NOTIFICATION") {
          setINAPPCount(type.count);
        }
        if (type.type === "WHATSAPP") {
          setWHATSAPPCount(type.count);
        }
      });
    } catch (error) {
      console.log("Getting error", error);
    }
    try {
      const eventResponse = await axios.get(
        "/api/masternotifications/get/countByEvent"
      );

      for (let i = 0; i < eventResponse.data.length; i++) {
        for (let j = 0; j < eventList.length; j++) {
          if (eventResponse.data[i].event === eventList[j].event) {
            eventList[j].count = eventResponse.data[i].count;
            // console.log("eventList", eventList);
            // setEventList({ })
          }
        }
      }

      // console.log("countByEvent.data", eventResponse);
      // setEventList(eventResponse.data);
    } catch (error) {
      console.log("Getting error", error);
    }
  };

  const getMaxLength = (templateType) => {
    switch (templateType) {
      case "SMS":
        return smsMaxLength;
      case "WHATSAPP":
        return whatsappMaxLength;
      default:
        return Infinity;
    }
  };

  // const handleEditorChange = (event, editor) => {
  //   try {
  //     if (editor) {
  //       const data = editor.getData();

  //       // Convert HTML to plain text
  //       const tempElement = document.createElement("div");
  //       tempElement.innerHTML = data;
  //       const textContent = tempElement.textContent || tempElement.innerText || "";

  //       const maxLength = getMaxLength(templateType);
  //       if (textContent.length > maxLength) {
  //         const trimmedContent = textContent.substring(0, maxLength);
  //         editor.setData(trimmedContent); // Set trimmed content back to the editor
  //         setMessageCount(maxLength);
  //         setMessage(trimmedContent);

  //         if (templateType === "SMS") {
  //           alert("150 characters exceeded");
  //         } else if (templateType === "WHATSAPP") {
  //           alert("1024 characters exceeded");
  //         }
  //       } else {
  //         setMessage(data);
  //         setMessageCount(textContent.length);
  //       }
  //     } else {
  //       console.error("Editor is undefined");
  //     }
  //   } catch (error) {
  //     console.error("Error in handleEditorChange:", error);
  //   }
  // };

  const handleEditorChange = (event, editor) => {
    try {
      if (editor) {
        const data = editor.getData();

        // Convert HTML to plain text
        const tempElement = document.createElement("div");
        tempElement.innerHTML = data;
        const textContent =
          tempElement.textContent || tempElement.innerText || "";

        const maxLength = getMaxLength(templateType);
        if (textContent.length > maxLength) {
          const trimmedContent = textContent.substring(0, maxLength);
          editor.setData(trimmedContent); // Set trimmed content back to the editor
          setMessageCount(maxLength);
          setMessage(trimmedContent);
        } else {
          setMessage(data);
          setMessageCount(textContent.length);
        }
      } else {
        console.error("Editor is undefined");
      }
    } catch (error) {
      console.error("Error in handleEditorChange:", error);
    }
  };

  useEffect(() => {
    if (params?._id) {
      fetchData(params?._id);
    }
  }, [params?._id]);

  useEffect(() => {
    var templateCloneId = sessionStorage?.getItem("templateCloneId");
    if (templateCloneId) {
      fetchData(templateCloneId);
    }
  }, []);

  const fetchData = async (id) => {
    // if (params?._id) {
    try {
      const response = await axios.get("/api/masternotifications/get/" + id);

      // reset({
      //   templateType: response.data.templateType,
      //   event: response.data.event,
      //   role: response.data.role,
      // });
      setTemplateType(response.data.templateType);
      setMessage(response.data.content);
      setSubject(response.data.subject);
      setEvent(response.data.event);
      setRole(response.data.role);
    } catch (error) {
      console.log("Getting error", error);
    }
    // }
  };

  const getRoleList = () => {
    axios
      .post("/api/roles/get/list")
      .then((response) => {
        //  console.log("response role",response);
        var roleList = [];
        for (let index = 0; index < response.data.length; index++) {
          let roleData = {
            role_id: response.data[index]._id,
            role: response.data[index].role,
          };
          roleList.push(roleData);
        }
        setRoleList(
          roleList.sort((a, b) => {
            return a.role.localeCompare(b.role);
          })
        );
        // console.log("roleList", roleList);
      })
      .catch((err) => console.log("err", err));
  };

  const validation = () => {
    const errorMsg = {};
    let inputIsValid = true;

    if (validator.isEmpty(templateType)) {
      inputIsValid = false;
      errorMsg.templateTypeError = "This field is required.";
    }
    if (validator.isEmpty(role)) {
      inputIsValid = false;
      errorMsg.roleError = "This field is required.";
    }
    if (validator.isEmpty(event)) {
      inputIsValid = false;
      errorMsg.eventError = "This field is required.";
    }
    if (templateType === "EMAIL" && validator.isEmpty(subject)) {
      inputIsValid = false;
      errorMsg.subjectError = "This field is required.";
    }

    setError(errorMsg);
    return inputIsValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    var user = JSON.parse(localStorage.getItem("userDetails"));
    // console.log("validation()",validation(),"event",event)
    if (validation()) {
      var formValues = {
        editId: params?._id,
        event: event,
        templateName: event,
        templateType: templateType,
        role: role,
        status: "active",
        subject: subject,
        content: message,
        createdBy: user.user_ID,
        user_id,
      };
      // console.log("formValues",formValues)
      const url = params?._id
        ? `/api/masternotifications/update`
        : "/api/masternotifications/post";

      // Define the method based on the condition
      const method = params?._id ? "patch" : "post";

      try {
        const response = await axios({
          url: url,
          method: method,
          data: formValues,
        });

        if (response.data.message === "Notification Details already exists") {
          Swal.fire(" ", "The template already exists");
        } else if (response.data.message === "Master notifications Found") {
          Swal.fire(" ", "Template already exists");
        } else if (
          response.data.message === "Master notifications are not modified"
        ) {
          Swal.fire(" ", "Master notifications are not modified");
        } else if (response.data.message === "Master notifications Updated") {
          Swal.fire(" ", "Template updated successfully");

          setLoading(true);
          if (templateType.toLowerCase().trim() === "email") {
            window.location.href =
              "/admin/notification-management/email-template";
          } else if (templateType.toLowerCase().trim() === "sms") {
            window.location.href =
              "/admin/notification-management/sms-template";
          } else if (
            templateType.toLowerCase().trim() === "inapp notification"
          ) {
            window.location.href =
              "/admin/notification-management/in-app-template";
          } else if (templateType.toLowerCase().trim() === "whatsapp") {
            window.location.href =
              "/admin/notification-management/whatsapp-template";
          }
        } else {
          Swal.fire(" ", templateType + " Template added successfully");
          // window.location.reload();
          setLoading(true);
          if (templateType.toLowerCase().trim() === "email") {
            window.location.href =
              "/admin/notification-management/email-template";
          } else if (templateType.toLowerCase().trim() === "sms") {
            window.location.href =
              "/admin/notification-management/sms-template";
          } else if (
            templateType.toLowerCase().trim() === "inapp notification"
          ) {
            window.location.href =
              "/admin/notification-management/in-app-template";
          } else if (templateType.toLowerCase().trim() === "whatsapp") {
            window.location.href =
              "/admin/notification-management/whatsapp-template";
          }
        }
        var templateCloneId = sessionStorage?.removeItem("templateCloneId");
      } catch (error) {
        console.error("Error submit:", error);
        Swal.fire(" ", "Oops…Something went wrong. Please try again later!");
      }
    } else {
      console.log("else validation ");
    }
  };
  const editorConfiguration = {
    toolbar: [
      "heading",
      "|",
      "bold",
      "italic",
      "link",
      "bulletedList",
      "numberedList",
      "|",
      "indent",
      "outdent",
      "|",
      "blockQuote",
      "insertTable",
      "mediaEmbed",
      "undo",
      "redo",
    ],
    // Set the height of the editor content area
    height: "1500px",
  };

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300">
            <h1 className="heading">Notification Management</h1>
          </div>
        </div>
        {/* <div className="px-10 py-6"> */}
        <div className="px-4 py-6 sm:px-6 md:px-10 lg:px-12">
          <div className="p-10 flex text-xl font-semibold justify-center">
            {/* <div className="grid grid-cols bg-grey-200 mb-8 border h-full w-full p-10"> */}
            <div className="mb-8 border h-full w-full p-4 gap-4">
              <h2 className="subHeading col-span-full">Add New Template</h2>
              <form onSubmit={handleSubmit} className="w-full col-span-full">
                <div className="grid  gap-6 mb-6 md:grid-cols-3 lg:grid-cols-3 mt-4 w-full">
                  <div className="col-span-full sm:col-span-1">
                    <label
                      htmlFor="templateType"
                      // className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      className="inputLabel"
                    >
                      Template Type<i className="text-red-500"> *</i>
                    </label>
                    <select
                      id="templateType"
                      value={templateType}
                      onChange={(e) => {
                        setTemplateType(e.target.value);
                      }}
                      // className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      // className="stdSelectField py-1"
                      className={`stdSelectField pl-3 py-0
                      ${
                        templateType
                          ? "selectOption"
                          : "font-normal text-gray-400"
                      }
                      `}
                    >
                      <option disabled value="">
                        -- Select Template Type --
                      </option>
                      <option value="EMAIL" className="text-black">
                        {"EMAIL (" + emailCount + ")"}
                      </option>
                      <option value="SMS" className="text-black">
                        {"SMS (" + smsCount + ")"}
                      </option>
                      <option value="INAPP NOTIFICATION" className="text-black">
                        {"INAPP NOTIFICATION (" + inappCount + ")"}
                      </option>
                      <option value="WHATSAPP" className="text-black">
                        {"WHATSAPP NOTIFICATION (" + whatsappCount + ")"}
                      </option>
                    </select>
                    <div
                      className="text-red-500"
                      style={{ fontSize: "12px", fontWeight: "normal" }}
                    >
                      {error?.templateTypeError}
                    </div>
                  </div>
                  <div className="col-span-full sm:col-span-1">
                    <label
                      htmlFor="event"
                      // className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      className="inputLabel"
                    >
                      Event<i className="text-red-500"> *</i>
                    </label>
                    <select
                      id="event"
                      value={event}
                      onChange={(e) => {
                        // console.log("e.target.value",e.target.value)
                        setEvent(e.target.value);
                      }}
                      // className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      // className="stdSelectField py-1"
                      className={`stdSelectField pl-3 py-0
                      ${event ? "selectOption" : "font-normal text-gray-400"}
                      `}
                    >
                      <option disabled value="">
                        -- Select Event --
                      </option>
                      {eventList?.map((item, index) => {
                        return (
                          // <option key={index} value={item}>{item}</option>(
                          <option
                            key={index}
                            value={item.event}
                            className="text-black"
                          >
                            {item.event + " (" + item.count + ")"}
                          </option>
                        );
                      })}
                    </select>
                    <div
                      className="text-red-500"
                      style={{ fontSize: "12px", fontWeight: "normal" }}
                    >
                      {error?.eventError}
                    </div>
                  </div>
                  <div className="col-span-full sm:col-span-1">
                    <label
                      htmlFor="role"
                      // className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      className="inputLabel py-1"
                    >
                      Role<i className="text-red-500"> *</i>
                    </label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => {
                        setRole(e.target.value);
                      }}
                      // className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      // className="stdSelectField py-1"
                      className={`stdSelectField pl-3 py-0
                  ${role ? "selectOption" : "font-normal text-gray-400"}
                  `}
                    >
                      <option disabled value="">
                        -- Select Role --
                      </option>
                      {roleList?.map((item, index) => {
                        return (
                          <option
                            key={index}
                            value={item.role}
                            className="text-black"
                          >
                            {item.role}
                          </option>
                        );
                      })}
                    </select>
                    <div
                      className="text-red-500"
                      style={{ fontSize: "12px", fontWeight: "normal" }}
                    >
                      {error?.roleError}
                    </div>
                  </div>
                </div>
                {templateType == "EMAIL" && (
                  <div className="mb-6">
                    <label
                      htmlFor="subject"
                      // className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      className="inputLabel"
                    >
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="subject"
                      value={subject}
                      onChange={(e) => {
                        setSubject(e.target.value);
                      }}
                      className="stdInputField pl-4"
                      // className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green focus:border-green block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Enter Subject..."
                    />
                    <div
                      className="text-red-500"
                      style={{ fontSize: "12px", fontWeight: "normal" }}
                    >
                      {error?.subjectError}
                    </div>
                  </div>
                )}
                {/* <div className="mt-2 font-normal text-sm">
                  <label className="">Message</label>
                  <div className="h-2"></div>

                  <div className="custom-editor">
                    {editorLoaded ? (
                      <CKEditor
                        editor={ClassicEditor}
                        data={message}
                        id="message"
                        onReady={(editor) => {
                          // You can store the "editor" and use when it is needed.
                          console.log("Editor is ready to use!");
                        }}
                        // config={{
                        //   height: "1200px", // Optional: Config method to set height
                        // }}
                        config={editorConfiguration}
                        onChange={(event, editor) => {
                          const data = editor.getData();
                          // console.log("data",data);
                          setMessage(data);
                          clearErrors("message");
                        }}
                        onBlur={(event, editor) => {}}
                        onFocus={(event, editor) => {}}
                      />
                    ) : (
                      <div>Editor loading...</div>
                    )}
                    {errors?.message && (
                      <span className="text-sm font-medium text-red-500">
                        {errors.message.message}
                      </span>
                    )}
                  </div>
                </div> */}

                <div className="mt-2 font-normal text-sm">
                  <label className="inputLabel flex justify-between items-center">
                    Message
                    <span className="text-red-500 text-[13px]">
                      ({messageCount}/
                      {templateType === "SMS"
                        ? smsMaxLength
                        : templateType === "WHATSAPP"
                        ? whatsappMaxLength
                        : "No limit"}
                      )
                    </span>
                  </label>
                  <div className="h-2"></div>
                  <div className="custom-editor">
                    {editorLoaded ? (
                      <CKEditor
                        editor={ClassicEditor}
                        data={message}
                        id="message"
                        config={editorConfiguration}
                        onReady={(editor) => {
                          // Safe onReady check
                          editor.model.document.on("change:data", (event) =>
                            handleEditorChange(event, editor)
                          );
                        }}
                      />
                    ) : (
                      <div>Editor loading...</div>
                    )}
                  </div>
                  <div className="text-red-500 mt-5">
                    {templateType === "SMS" && message.length > 150 ? (
                      <div>
                        {" "}
                        "Oops! Your message exceed the limit. Please shorten it
                        to 150 characters or less and resend."{" "}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                  <div className="text-red-500 mt-5">
                    {templateType === "WHATSAPP" && message.length > 1024 ? (
                      <div>
                        {" "}
                        "Oops! Your message exceed the limit. Please shorten it
                        to 1024 characters or less and resend."{" "}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    // className="text-white bg-site hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-16 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    className="formButtons"
                  >
                    {loading && params?._id ? (
                      <span>
                        Update
                        <FaSpinner className="animate-spin inline-flex mx-2 text-lg text-white text-center" />
                      </span>
                    ) : loading ? (
                      <span>
                        Submit
                        <FaSpinner className="animate-spin inline-flex mx-2 text-lg text-white text-center" />
                      </span>
                    ) : (
                      button
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Modal
        show={successModal}
        size="md"
        onClose={() => setSuccessModal(false)}
        popup
      >
        <Modal.Header className="modalHeader justify-end">
          <div
            className="modalCloseButton"
            onClick={() => setSuccessModal(false)}
          >
            <MdClose className="icon text-white font-medium" />
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="modalBody">
            <h3 className="modalText">{msg}</h3>
            <div className="flex justify-center gap-4">
              <button
                className="modalSuccessBtn"
                onClick={() => setSuccessModal(false)}
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
            <h3 className="modalText">Oops!</h3>
            <div className="modelText">Something went wrong!</div>
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
      </Modal>
    </section>
  );
}

export default AddTemplate;
