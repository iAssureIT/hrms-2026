import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";
import { MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdDelete } from "react-icons/md";
import { MdClose } from "react-icons/md";
import { Modal, Tooltip } from "flowbite-react";
import { FaEdit, FaSpinner, FaFileDownload } from "react-icons/fa";
import { MdWidgets } from "react-icons/md";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as XLSX from "xlsx";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import { FaFileUpload, FaWpforms } from "react-icons/fa";
import { BsPlusSquare } from "react-icons/bs";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
// import { AiFillProduct } from "react-icons/ai";
// import S3UploadComponent from "../S3UploadComponent/S3UploadComponent";
import BulkUpload from "./BulkUpload.js";
const OneFieldComponent = ({
  fieldLabel,
  setCheckReload,
  updateDropdownValue,
  setUpdateDropdownValue,
  goodRecordsHeading,
  failedtableHeading,
  fileDetailUrl,
  apiPath, // Added apiPath prop
}) => {
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
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

  const [deleteId, setDeleteId] = useState("");
  const [errorr, setErrorr] = useState("");


  let [recsPerPage, setRecsPerPage] = useState(10);
  let [numOfPages, setNumOfPages] = useState([]);
  let [pageNumber, setPageNumber] = useState(1);
  let [totalRecs, setTotalRecs] = useState(0);
  const startSerialNumber = (pageNumber - 1) * recsPerPage + 1;


  // const [updateDropdownValue, setUpdateDropdownValue] = useState(initialValue);

  const createInputObj = (label, user_id) => {
    const lowercaseLabel = apiPath ? apiPath : label.toLowerCase().replace(/\s+/g, '-');
    const apiBase = "/api/" + lowercaseLabel;

    return {
      fieldlabel: label,
      insertAPI: apiBase + "/post",
      getListAPI: apiBase + "/getdata",
      editAPI: apiBase + "/put",
      deleteAPI: apiBase + "/delete",
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

  useEffect(() => {
    const userDetails = localStorage?.getItem("userDetails");
    const userDetailsParse = JSON.parse(userDetails);
    const userID = userDetailsParse?.user_id;

    const oneField = createInputObj(fieldLabel, userID);
    setOneField(oneField);

    const getData = async () => {
      try {
        setLoading(true);
        var formValues = {
          recsPerPage: recsPerPage,
          pageNumber: pageNumber,
        };

        const response = await axios.post(oneField.getListAPI, formValues);

        if (response.data.success) {
          setTotalRecs(response.data.totalRecs);
          setData(response.data.tableData);
          setLoading(false);
        } else {
          Swal.fire(" ", response.data.errorMsg);
        }


        if (typeof setCheckReload === "function") {
          setCheckReload((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Error fetching:", error);
      }
    };

    getData();
  }, [pageNumber, recsPerPage, runCount]);

  useEffect(() => {
    pagesLogic();
  }, [recsPerPage, totalRecs]);

  const pagesLogic = () => {
    if (!totalRecs || !recsPerPage) {
      setNumOfPages([]);
      return;
    }

    const totalPages = Math.ceil(totalRecs / recsPerPage);

    const pageArr = Array.from({ length: totalPages }, (_, i) => i + 1);

    setNumOfPages(pageArr);
  };


  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (field.trim() === "") {
  //     setErrorMessage("This field is required ");
  //     return;
  //   }

  //   let method = "";
  //   let apiUrl = "";
  //   let formValues = {
  //     fieldValue: field,
  //     fieldLableName: oneField.fieldlabel,
  //     imageName: imageName,
  //     imageUrl: imageUrl,
  //     user_id,
  //   };

  //   if (checkUpdate) {
  //     method = "put";
  //     apiUrl = oneField.editAPI + "/" + updateID;
  //   } else {
  //     method = "post";
  //     apiUrl = oneField.insertAPI;
  //     setCheckUpdate(false);
  //   }

  //   try {
  //     const response = await axios({
  //       method: method,
  //       url: apiUrl,
  //       data: formValues,
  //     });

  //     if (response.data.updated) {
  //       Swal.fire(" ", `${oneField.fieldlabel} updated successfully.`).then(
  //         () => {
  //           setCheckUpdate(false)
  //           setField("");
  //         }
  //       );
  //     } else if (checkUpdate) {
  //       Swal.fire(
  //         " ",
  //         `${oneField.fieldlabel} was not changed hence no update.`
  //       );
  //     } else {
  //       Swal.fire(" ", `${oneField.fieldlabel} added successfully.`).then(
  //         () => {
  //           setField("");
  //         }
  //       );
  //     }


  //     setRunCount((count) => count + 1);
  //   } catch (err) {
  //     const errorMessage =
  //       err.response && err.response.data && err.response.data.message
  //         ? err.response.data.message
  //         : "An unexpected error occurred";
  //     setErrorr(errorMessage);
  //     Swal.fire(" ", "Something went wrong! <br/>" + errorMessage);
  //     if (errorMessage) {
  //       setField("");
  //     }
  //   }

  //   setImageUrl("");
  //   setImageName("");
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (field.trim() === "") {
      setErrorMessage("This field is required");
      return;
    }

    const isUpdate = checkUpdate; 

    let apiUrl = isUpdate
      ? oneField.editAPI + "/" + updateID
      : oneField.insertAPI;

    let method = isUpdate ? "put" : "post";

    const formValues = {
      fieldValue: field,
      fieldLableName: oneField.fieldlabel,
      imageName,
      imageUrl,
      user_id,
    };

    try {
      const response = await axios({
        method,
        url: apiUrl,
        data: formValues,
      });

      // ✅ UPDATE CASE
      if (isUpdate) {
        if (response.data.success === false) {
          Swal.fire("Info", `${oneField.fieldlabel} was not changed hence no update.`);
        } else {
          Swal.fire("Success", `${oneField.fieldlabel} updated successfully.`);
        }
      }
      // ✅ ADD CASE
      else {
        Swal.fire("Success", `${oneField.fieldlabel} added successfully.`);
      }

      // ✅ Reset Everything
      setField("");
      setImageUrl("");
      setImageName("");
      setCheckUpdate(false);
      setRunCount((count) => count + 1);

    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || "An unexpected error occurred";

      setErrorr(errorMessage);

      Swal.fire(" ", errorMessage);

      setField("");
      setImageUrl("");
      setImageName("");
    }
  };

  const handleDelete = (id) => {
    setRunCount((count) => count + 1);

    Swal.fire({
      title: ` `,
      text: `Are you sure you want to delete this  ${oneField.fieldlabel}?`,

      showCancelButton: true,
      cancelButtonText: "No, don't delete!",
      cancelButtonColor: "#50c878",
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
              title: "Success",
              text: `${oneField.fieldlabel} have been deleted.`,
            });
            setRunCount((count) => count + 1);
          })
          .catch((error) => {
            console.log("Error Message from list delete redirect  => ", error);
            Swal.fire(" ", "Something Went Wrong <br/>" + errorMessage);
          });
      }
      // else {
      //   Swal.fire({
      //     title: " ",
      //     text: `${oneField.fieldlabel} is safe.`,

      //   });
      // }
    });
  };

  const handleEditClick = (item) => {
    setField(item.fieldValue);
    setUpdateID(item._id);
    setCheckUpdate(true);
    setImageUrl(item.imageUrl);
    setImageName(item.imageName);
  };

  const exportToExcel = () => {
    // Create a new workbook and a worksheet
    const workbook = XLSX.utils.book_new();
    const tableHeading = {
      fieldValue: fieldLabel,
    };
    const worksheetData = [Object.values(tableHeading)];
    var formValues = {
      recsPerPage: recsPerPage,
      pageNumber: pageNumber,
    };
    // console.log("formvalues",formvalues)
    axios({
      method: "post",
      url: oneField.getListAPI,
      data: formValues,
    })
      .then((response) => {
        // console.log("response", response);
        var downloadData = response.data.tableData;

        // Add data to the worksheet
        downloadData.forEach((row) => {
          const rowData = Object.keys(tableHeading).map((key) => {
            if (key === "fieldValue") {
              return row.fieldValue || row.centerName;
            }
            return row[key];
          });
          worksheetData.push(rowData);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        // Generate Excel file and download
        XLSX.writeFile(workbook, fieldLabel + ".xlsx");
      })
      .catch((error) => {
        console.log("Error Message from userslist delete redirect  => ", error);
        Swal.fire(" ", "Error Message from userslist delete redirect  =>");
      });
  };

  return (
    <section className="font-body box border-2 rounded-md shadow-md">
      {/* <div className="text-xl font-semibold">
        <div className="border-b uppercase py-5 ps-6">
          <h1>Add {oneField.fieldlabel}</h1>
        </div>
      </div> */}
      <div className="border-b py-5 px-6 flex items-center justify-between">
        {/* Heading */}
        <h1 className="text-xl font-semibold uppercase">
          Add {oneField.fieldlabel}
        </h1>

        {/* Small Buttons */}
        <div className="flex gap-2">
          <Tooltip
            content={activeTab === "bulk" ? "Go to Form" : "Bulk Upload"}
            placement="bottom"
            arrow={false}
            className="z-50 bg-green text-white text-sm px-2 py-1 rounded"
          >
            <div>
              {activeTab === "failure" ? (
                <BsPlusSquare
                  className="cursor-pointer text-green border border-green p-0.5 rounded text-[30px]"
                  onClick={() => setActiveTab("active")}
                />
              ) : (
                <FaFileUpload
                  className="cursor-pointer text-green border border-green p-0.5 rounded text-[30px]"
                  onClick={() => setActiveTab("failure")}
                />
              )}
            </div>
          </Tooltip>
        </div>
      </div>
      <div>
        {/* <div className="flex mt-4 mb-10 capitalise justify-end">
          <button
            className={`px-6 py-2 hover:bg-gray-200 font-medium ${activeTab === "active"
              ? "text-green bg-gray-100 border-green border-b-2"
              : "text-gray-700"
              }`}
            onClick={() => setActiveTab("active")}
          >
            Form
          </button>
          <button
            className={`px-6 py-2 hover:bg-gray-200 font-medium ${activeTab === "failure"
              ? "text-green bg-gray-100 border-green border-b-2"
              : "text-gray-700"
              }`}
            onClick={() => setActiveTab("failure")}
          >
            Bulk Upload
          </button>
        </div> */}
        {/* form tab */}
        <div>
          {activeTab === "active" ? (
            <div className=" flex flex-col shadow-none z-50 w-10/12   mx-auto pt-10">
              <div className="space-y-6 pb-10">
                <form onSubmit={handleSubmit} className="lg:ps-4 mx-auto">
                  <div className="lg:w-8/12 mx-auto w-full">
                    <div className="inline-flex text-center">
                      <h2
                        // className="font-semibold text-sm mt-1 text-gray-51"
                        className="inputLabel"
                      >
                        {oneField.fieldlabel}
                        <span className="text-red-400 ms-1">*</span>
                      </h2>
                    </div>
                    <div className="flex mt-2 justify-center">
                      <div className="relative  border border-gray-300 mt-2 rounded-md shadow-sm w-full">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                            <MdWidgets className="icon" />
                          </span>
                        </div>
                        <input
                          type="text"
                          id="inputField"
                          className="stdInputField"
                          // className="text-gray-900 rounded-e-md focus:shadow-md block flex-1 min-w-0 w-full text-sm border-gray-300 p-2 outline-none"
                          placeholder={`${oneField.fieldlabel ? oneField.fieldlabel : ""
                            }`}
                          // defaultValue={field}
                          value={field}
                          required
                          onChange={(e) => {
                            setField(e.target.value.trim());
                            if (errorMessage) {
                              setErrorMessage(""); // Clear error message when user starts typing
                            }
                          }}
                        />
                      </div>
                    </div>
                    {errorMessage && (
                      <p style={{ color: "red" }}>{errorMessage}</p>
                    )}
                    <div className="mb-10 flex justify-between mt-3">
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

                      <div className="w-full lg:w-auto">
                        <button
                          type="submit"
                          className="formButtons"
                        // className="text-white bg-gradient-to-r bg-[#4285F4] hover:bg-[#4879be] focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg inline-flex items-center font-medium rounded-sm text-sm px-5 h-8 text-center mb-2"
                        >
                          {checkUpdate ? "Update" : "Submit"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
                {/* <div className="relative overflow-x-auto lg:mx-14 text-left lg:w-1/2 mx-auto w-full"></div> */}
                <h1 className="heading uppercase py-2 ms-4 text-center">
                  {fieldLabel} List
                </h1>
                <div className="relative  lg:mx-auto text-left mx-auto lg:w-8/12 w-full">
                  <div>
                    <div className="flex lg:flex-row md:flex-col flex-col mt-2 ps-3 justify-between w-full">
                      <div className="text-sm">
                        <label
                          htmlFor="recsPerPage"
                          // className="mb-4 font-semibold"
                          className="inputLabel"
                        >
                          Records per Page
                        </label>
                        <div className="relative mt-2 rounded-md text-gray-500 w-full">
                          <select
                            // className="w-full border mt-2 text-sm"
                            // className="stdSelectField py-1.5"
                            className={`${recsPerPage
                              ? "stdSelectField pl-3 w-3/4"
                              : "stdSelectField pl-3 w-3/4"
                              } ${recsPerPage ? "selectOption" : "font-normal"}
                                `}
                            onChange={(event) => {
                              setRecsPerPage(event.target.value);
                            }}
                          >
                            <option defaultValue={10} className="font-normal">
                              10
                            </option>
                            <option defaultValue={20} className="font-normal">
                              20
                            </option>
                            <option defaultValue={50} className="font-normal">
                              50
                            </option>
                            <option defaultValue={100} className="font-normal">
                              100
                            </option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-7 ml-4">
                        <Tooltip
                          content="Download as Excel"
                          placement="top"
                          className="z-50 bg-green text-white text-sm px-2 py-1 rounded"
                          arrow={false}
                        >
                          <FaFileDownload
                            onClick={exportToExcel}
                            size={"2rem"}
                            className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                          />
                        </Tooltip>
                      </div>
                    </div>
                    <table className="w-full overflow-x-auto border-separate border-spacing-y-2 text-sm text-center ps-3 rtl:text-right  text-gray-500 dark:text-gray-400">
                      <thead className="text-[13px] text-gray-700  uppercase  px-10 dark:text-gray-400  border border-grayTwo">
                        <tr className="font-bold text-gray-900 whitespace-nowrap dark:text-white py-4">
                          <th
                            scope="col"
                            className="px-6 py-4 border border-grayTwo border-r-0 "
                          >
                            Sr.No
                          </th>
                          <td
                            scope="col"
                            className="px-6 py-4 border border-grayTwo border-l-0"
                          >
                            Action
                          </td>
                          <td
                            scope="col"
                            className="px-6 py-4 border border-grayTwo border-r-1 border-l-0"
                          >
                            {oneField.fieldlabel}
                          </td>
                          {oneField.showImg === true && (
                            <td
                              scope="col"
                              className="px-6 py-4 border border-grayTwo border-l-0"
                            >
                              Icon
                            </td>
                          )}
                        </tr>
                      </thead>
                      <tbody className="border border-grayTwo">
                        {loading ? (
                          <tr

                            className="odd:bg-grayOne odd:dark:bg-gray-900 even:bg-gray-50 border border-grayTwo  text-gray-900 font-normal">
                            <td
                              colSpan={3}
                              className="text-center text-Green text-3xl"
                            >
                              <FaSpinner className="animate-spin inline-flex mx-2" />
                            </td>
                          </tr>
                        ) : // <div className="text-center text-Green text-lg">
                          //   <FaSpinner className="animate-spin inline-flex mx-2" />
                          // </div>
                          data && Array.isArray(data) && data.length > 0 ? (
                            data.map((item, index) => {
                              const serialNumber = startSerialNumber + index;
                              return (
                                <tr
                                  key={item._id || index} className="odd:bg-grayOne odd:dark:bg-gray-900 even:bg-gray-50 border border-grayTwo  text-gray-900 font-normal">
                                  <th
                                    scope="row"
                                    className="px-6 py-4 font-normal border border-grayTwo border-r-0 "
                                  >
                                    {serialNumber}
                                  </th>
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
                                          className="  border border-red-500 text-red-500 p-1 cursor-pointer rounded-sm hover:border-red-400 hover:text-red-400"
                                          size={"1.3rem"}
                                          onClick={() => {
                                            handleDelete(item._id);
                                          }}
                                        />
                                      </Tooltip>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-[13px] border border-grayTwo border-r-1 border-l-0">
                                    {item.fieldValue || item.centerName}
                                  </td>
                                  {oneField.showImg === true && (
                                    <td className="px-6 py-4 border border-grayTwo border-l-0">
                                      <img
                                        src={item.imageUrl}
                                        alt="icon img"
                                        className="h-10 mx-auto hover:scale-150 cursor-pointer"
                                      />
                                    </td>
                                  )}
                                </tr>
                              );
                            })
                          ) : (
                            <tr className="odd:bg-grayOne odd:dark:bg-gray-900 even:bg-gray-50 border border-grayTwo  text-gray-900 font-normal">
                              <td colSpan={3} className="text-center">
                                No Record Found!
                              </td>
                            </tr>
                          )}
                      </tbody>
                    </table>
                    {/* <div className="flex overflow-x-auto w-full mt-8">
                      <nav aria-label="  Page navigation flex">
                        {pageNumber !== 1 && (
                          <li
                            className="page-item hover pe-3 border border-gray-400 cursor-pointer text-center border-e-0"
                            onClick={() => setPageNumber((prev) => prev - 1)}
                          >
                            <a className="page-link">
                              <FontAwesomeIcon icon={faAngleLeft} />
                            </a>
                          </li>
                        )}
                      </nav>
                    </div> */}

                    <div className="flex justify-center mt-8">
                      {numOfPages.length > 1 && (
                        <ul className="flex items-center gap-2">

                          {/* Previous Button */}
                          {pageNumber > 1 && (
                            <li
                              onClick={() => setPageNumber((prev) => prev - 1)}
                              className="px-3 py-1 border border-gray-400 cursor-pointer hover:bg-gray-200"
                            >
                              {/* <FontAwesomeIcon icon={faAngleLeft} /> */}
                              <IoIosArrowBack size={24} />
                            </li>
                          )}

                          {/* Page Numbers */}
                          {numOfPages.map((page) => (
                            <li
                              key={page}
                              onClick={() => setPageNumber(page)}
                              className={`px-3 py-1 border border-gray-400 cursor-pointer ${pageNumber === page
                                ? "bg-green text-white font-semibold"
                                : "hover:bg-gray-200"
                                }`}
                            >
                              {page}
                            </li>
                          ))}

                          {/* Next Button */}
                          {pageNumber < numOfPages.length && (
                            <li
                              onClick={() => setPageNumber((prev) => prev + 1)}
                              className="px-3 py-1 border border-gray-400 cursor-pointer hover:bg-gray-200"
                            >
                              {/* <FontAwesomeIcon icon={faAngleRight} /> */}
                              <IoIosArrowForward size={24} />
                            </li>
                          )}
                        </ul>
                      )}
                    </div>



                  </div>
                </div>
              </div>
            </div>
          ) : (
            <BulkUpload
              fieldLabel={fieldLabel}
              goodRecordsHeading={goodRecordsHeading}
              failedtableHeading={failedtableHeading}
              fileDetailUrl={fileDetailUrl}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default OneFieldComponent;
