import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { MdOutlineEdit } from "react-icons/md";
import { MdClose } from "react-icons/md";
import { Modal, Tooltip } from "flowbite-react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdWidgets } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";

const OneFieldComponents = ({ fieldLabel, setCheckRelode }) => {
  const [field, setField] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [data, setData] = useState([]);
  const [runCount, setRunCount] = useState(0);
  const [updateID, setUpdateID] = useState("");
  const [checkUpdate, setCheckUpdate] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [oneField, setOneField] = useState("");
  const [user_id, setUser_id] = useState();
  const [loading, setLoading] = useState(true);

  const [deleteId, setDeleteId] = useState("");
  const [errorr, setErrorr] = useState("");

  const createInputObj = (label, user_id) => {
    const lowercaseLabel = label.toLowerCase();

    return {
      fieldlabel: label,
      insertAPI: "/api/" + lowercaseLabel + "s" + "/post",
      getListAPI: "/api/" + lowercaseLabel + "s" + "/get",
      editAPI: "/api/" + lowercaseLabel + "s" + "/put",
      deleteAPI: "/api/" + lowercaseLabel + "s" + "/delete",
      showImg: false,
      user_id: user_id,
    };
  };
  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const userDetailsParse = JSON.parse(userDetails);
      const parseUser_id = userDetailsParse.user_id;
      setUser_id(parseUser_id);
    }
  }, []);
  // useEffect(() => {
  //   const userDetails = localStorage?.getItem("userDetails");
  //   const userDetailsParse = JSON.parse(userDetails);
  //   const userID = userDetailsParse?.user_id;

  //   console.log("userID", userID);
  //   const oneField = createInputObj(fieldLabel, userID);
  //   setOneField(oneField);
  //   console.log("oneField", oneField);
  // }, []);

  useEffect(() => {
    const userDetails = localStorage?.getItem("userDetails");
    const userDetailsParse = JSON.parse(userDetails);
    const userID = userDetailsParse?.user_id;

    const oneField = createInputObj(fieldLabel, userID);
    setOneField(oneField);

    const getData = async () => {
      try {
        const response = await axios.get(oneField.getListAPI);

        setData(response.data);
        if (response.data.length > 0) {
          setLoading(false);
        }

        setCheckRelode((count) => count + 1);
      } catch (error) {
        console.error("Error fetching:", error);
      }
    };
    getData();
  }, [runCount]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (field.trim() === "") {
      setErrorMessage("This field is required ");
      return;
    }

    let method = "";
    let apiUrl = "";
    let formValues = {
      fieldValue: field,
      fieldLableName: oneField.fieldlabel,
      imageName: imageName,
      imageUrl: imageUrl,
      user_id,
    };

    if (checkUpdate) {
      method = "put";
      apiUrl = oneField.editAPI + "/" + updateID;
    } else {
      method = "post";
      apiUrl = oneField.insertAPI;
      setCheckUpdate(false);
    }

    try {
      const response = await axios({
        method: method,
        url: apiUrl,
        data: formValues,
      });

      if (response.data.updated) {
        Swal.fire(" ", `${oneField.fieldlabel} updated successfully.`);
        setField("");
      } else if (checkUpdate) {
        Swal.fire(
          " ",
          `${oneField.fieldlabel} was not changed hence no update.`
        );
      } else {
        Swal.fire(" ", `${oneField.fieldlabel} added successfully.`);
        setField("");
      }

      setRunCount((count) => count + 1);
    } catch (err) {
      const errorMessage =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "An unexpected error occurred";
      setErrorr(errorMessage);
      Swal.fire(" ", "Something went wrong! <br/>" + errorMessage);
    }

    setImageUrl("");
    setImageName("");
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (field.trim() === "") {
  //     setErrorMessage("Input field must not be empty");
  //     return;
  //   }

  //   let method = "";
  //   let apiUrl = "";
  //   let formValues = {};

  //   formValues = {
  //     fieldValue: field,
  //     fieldLableName: oneField.fieldlabel,
  //     imageName: imageName,
  //     imageUrl: imageUrl,
  //     user_id,
  //   };

  //   if (checkUpdate) {
  //     method = "put";
  //     apiUrl = oneField.editAPI + "/" + updateID;
  //     // console.log("PUT method");
  //   } else {
  //     method = "post";
  //     apiUrl = oneField.insertAPI;
  //     // console.log("post method");
  //   }

  //   try {
  //     console.log("formValues === ", formValues);
  //     const response = await axios({
  //       method: method,
  //       url: apiUrl,
  //       data: formValues,
  //     })
  //       .then((responce) => {
  //         console.log(responce);

  //         Swal.fire(" ", `
  //                     ${oneField.fieldlabel}
  //                     ${checkUpdate ? "Updated" : "Added"} Successfully`)

  //         setRunCount((count) => count + 1);
  //       })
  //       .catch((err) => {
  //         // Extract error message from the response
  //         setCheckUpdate(false);
  //         const errorMessage = err.response && err.response.data && err.response.data.message
  //           ? err.response.data.message
  //           : 'An unexpected error occurred';
  //           setErrorr(errorMessage);

  //         Swal.fire(" ", "Something went wrong! <br/>" + errorMessage)
  //       });
  //   } catch (error) {
  //     console.log("error: " + error);

  //     Swal.fire(" ", "Something went wrong! <br/>" + errorMessage)
  //   }
  //   setField("");
  //   setImageUrl("");
  //   setImageName("");
  // };

  const handleDelete = (id) => {
    setRunCount((count) => count + 1);

    Swal.fire({
      title: ` `,
      text: `Are you sure you want to delete this  ${oneField.fieldlabel}?`,

      showCancelButton: true,
      cancelButtonText: "No, don't delete!",
      cancelButtonColor: "#3c8dbc",
      confirmButtonText: "Yes, delete it!",
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        confirmButton: "delete-btn",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${oneField.deleteAPI}/${id}`)
          .then((deletedUser) => {
            Swal.fire({
              title: " ",
              text: `${oneField.fieldlabel} have been deleted.`,
            });
            setRunCount((count) => count + 1);
          })
          .catch((error) => {
            console.log("Error Message from list delete redirect  => ", error);
            Swal.fire(" ", "Something Went Wrong <br/>" + errorMessage);
          });
      }
      // } else {
      //   Swal.fire({
      //     title: " ",
      //     text: `${oneField.fieldlabel} is Safe.`,

      //   });
      // }
    });
  };

  const handleEditClick = (item) => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scrolling behavior
    });
    // window.location.href = editURL+item._id
    setField(item.fieldValue);
    setUpdateID(item._id);
    setCheckUpdate(true);
    setImageUrl(item.imageUrl);
    setImageName(item.imageName);
  };

  return (
    <section className="hr-section">
      <div className="hr-card hr-fade-in border-0">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-8">
            <h1 className="hr-heading">
              {loading ? (
                <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
              ) : oneField.fieldlabel === "Unit" ? (
                "Unit of Measurement"
              ) : (
                oneField.fieldlabel
              )}
            </h1>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col pt-4">
            <div className="space-y-8 pb-10">
              <form onSubmit={handleSubmit} className="hr-card bg-slate-50/50 border-slate-100 shadow-none">
                <div className="lg:w-3/4 mx-auto w-full py-4">
                  <div className="hr-form-group">
                    <label className="hr-label">
                      {loading ? (
                        <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                      ) : (
                        oneField.fieldlabel
                      )}
                      <span className="text-red-500 ms-1">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 transition-colors group-focus-within:text-green-500">
                        <MdWidgets className="text-lg text-slate-400 group-focus-within:text-green-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        className="hr-input !pl-12 !py-3"
                        placeholder={`Enter ${oneField.fieldlabel ? oneField.fieldlabel : "value"}...`}
                        value={field}
                        required
                        onChange={(e) => {
                          setField(e.target.value);
                          if (errorMessage) {
                            setErrorMessage("");
                          }
                        }}
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <p className="text-red-500 font-normal text-[12px]">
                      {errorMessage}
                    </p>
                  )}
                  <div className="flex justify-between items-center mt-6">
                    <div>
                      {oneField.showImg === true && (
                        <S3UploadComponent
                          setImageName={setImageName}
                          setImageUrl={setImageUrl}
                          imageUrl={imageUrl}
                          imageName={imageName}
                          handleEditClick={handleEditClick}
                        />
                      )}
                    </div>

                    <div>
                      <button
                        type="submit"
                        className="hr-btn-primary"
                        onClick={handleSubmit}
                      >
                        {checkUpdate ? "Update Record" : "Save Record"}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
              <div className="border-t border-slate-100 pt-8 mt-10">
                <h1 className="hr-subheading text-center mb-6 uppercase tracking-wider">
                  Existing {fieldLabel}s
                </h1>
              </div>
              {/* <div className="relative overflow-x-auto lg:mx-14 text-left lg:w-1/2 mx-auto w-full"></div> */}
              <div className="relative text-left mx-auto lg:w-5/6 w-full">
                {data && data.length > 0 ? (
                  <div className="table-responsive relative overflow-hidden hover:overflow-auto">
                    <table className="w-full border-separate border-spacing-y-2 text-sm text-center ps-0 lg:ps-10 rtl:text-right  text-gray-500 dark:text-gray-400">
                      <thead className="text-xs text-gray-700  uppercase  px-10 dark:text-gray-400  border border-grayTwo">
                        <tr className="font-bold text-gray-900 whitespace-nowrap dark:text-white py-4">
                          <th
                            scope="col"
                            className="px-6 py-4 border border-grayTwo border-r-0"
                          >
                            Sr.No
                          </th>
                          <td
                            scope="col"
                            className="px-6 py-4 border border-grayTwo border-r-0 border-l-0"
                          >
                            {oneField.fieldlabel}
                          </td>
                          {/* {oneField.showImg === true && (
                        <td scope="col" className="px-6 py-3">
                          Icon
                        </td>
                      )} */}
                          <td
                            scope="col"
                            className="px-6 py-4 border border-grayTwo border-l-0"
                          >
                            Action
                          </td>
                        </tr>
                      </thead>
                      <tbody className="border-gray-200 border">
                        {data && Array.isArray(data)
                          ? data.map((item, index) => (
                              <tr className="odd:bg-grayOne odd:dark:bg-gray-900 even:bg-gray-50 border border-grayTwo  text-gray-900 font-normal">
                                <td
                                  scope="row"
                                  className="px-6 py-4 font-normal border border-grayTwo border-r-0"
                                >
                                  {index + 1}
                                </td>
                                <td className="px-6 py-4  border border-grayTwo border-r-0 border-l-0">
                                  {item.fieldValue}
                                </td>
                                {/* {oneField.showImg === true && (
                          <td className="px-6 py-4">
                            <img
                              src={item.imageUrl}
                              alt="icon img"
                              className="h-10 mx-auto hover:scale-150 cursor-pointer"
                            />
                          </td>
                        )} */}

                                <td className="px-6 py-4 border border-grayTwo border-l-0">
                                  <div className="flex gap-3 justify-center">
                                    <Tooltip
                                      content="Edit"
                                      placement="bottom"
                                      className="bg-green"
                                      arrow={false}
                                    >
                                      <MdOutlineEdit
                                        className="border border-gray-500 text-gray-500 p-1 cursor-pointer rounded-sm hover:border-gray-400 hover:text-gray-400"
                                        size={"1.3rem"}
                                        onClick={() => handleEditClick(item)}
                                      />
                                    </Tooltip>
                                    <Tooltip
                                      content="Delete"
                                      placement="bottom"
                                      className="bg-red-500"
                                      arrow={false}
                                    >
                                      <RiDeleteBin6Line
                                        className="border border-red-500 text-red-500 p-1 cursor-pointer rounded-sm hover:border-red-400 hover:text-red-400"
                                        size={"1.3rem"}
                                        onClick={() => {
                                          handleDelete(item._id);
                                        }}
                                      />
                                    </Tooltip>
                                  </div>
                                </td>
                              </tr>
                            ))
                          : "Data not found"}
                      </tbody>
                    </table>
                  </div>
                ) : loading ? (
                  <div className="text-center text-Green text-lg">
                    <FaSpinner className="animate-spin inline-flex mx-2" />
                  </div>
                ) : (
                  <div className="w-full text-center py-4 bg-gray-100 border border-gray-200">
                    Data not found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OneFieldComponents;
