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
import BulkUpload from "./BulkUpload.js";

// === Administrative Styling Helpers ===
const SectionHeader = ({ title, subtitle }) => (
    <div className="mb-5 border-b border-gray-100 pb-2">
        <h3 className="hr-subheading">{title}</h3>
        <p className="hr-section-subtitle">{subtitle}</p>
    </div>
);

const OneFieldComponent = ({
  fieldLabel,
  setCheckReload,
  updateDropdownValue,
  setUpdateDropdownValue,
  goodRecordsHeading,
  failedtableHeading,
  fileDetailUrl,
  apiPath,
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

  const [recsPerPage, setRecsPerPage] = useState(10);
  const [numOfPages, setNumOfPages] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalRecs, setTotalRecs] = useState(0);
  const startSerialNumber = (pageNumber - 1) * recsPerPage + 1;

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
    const userDetailsParse = userDetails ? JSON.parse(userDetails) : null;
    const userID = userDetailsParse?.user_id;

    const oneFieldObj = createInputObj(fieldLabel, userID);
    setOneField(oneFieldObj);

    const getData = async () => {
      try {
        setLoading(true);
        const formValues = {
          recsPerPage: recsPerPage,
          pageNumber: pageNumber,
        };

        const response = await axios.post(oneFieldObj.getListAPI, formValues);

        if (response.data.success) {
          setTotalRecs(response.data.totalRecs);
          setData(response.data.tableData);
          setLoading(false);
        } else {
          Swal.fire(" ", response.data.errorMsg || "Error fetching data");
          setLoading(false);
        }

        if (typeof setCheckReload === "function") {
          setCheckReload((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Error fetching:", error);
        setLoading(false);
      }
    };

    if (oneFieldObj.getListAPI) {
      getData();
    }
  }, [pageNumber, recsPerPage, runCount, fieldLabel]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (field.trim() === "") {
      setErrorMessage("This field is required");
      return;
    }

    const isUpdate = checkUpdate; 
    const apiUrl = isUpdate
      ? oneField.editAPI + "/" + updateID
      : oneField.insertAPI;

    const method = isUpdate ? "put" : "post";

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

      if (isUpdate) {
        if (response.data.success === false) {
          Swal.fire("Info", `${oneField.fieldlabel} was not changed hence no update.`);
        } else {
          Swal.fire("Success", `${oneField.fieldlabel} updated successfully.`);
        }
      } else {
        Swal.fire("Success", `${oneField.fieldlabel} added successfully.`);
      }

      setField("");
      setImageUrl("");
      setImageName("");
      setCheckUpdate(false);
      setRunCount((count) => count + 1);

    } catch (err) {
      const errorMsg = err?.response?.data?.message || "An unexpected error occurred";
      setErrorr(errorMsg);
      Swal.fire(" ", errorMsg);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: " ",
      text: `Are you sure you want to delete this ${oneField.fieldlabel}?`,
      showCancelButton: true,
      cancelButtonText: "No",
      confirmButtonText: "Yes, delete it!",
      reverseButtons: true,
      focusCancel: true,
      customClass: { confirmButton: "delete-btn" },
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`${oneField.deleteAPI}/${id}`)
          .then(() => {
            Swal.fire("Success", `${oneField.fieldlabel} deleted.`);
            setRunCount((count) => count + 1);
          })
          .catch((error) => {
            Swal.fire("Error", "Something went wrong.");
          });
      }
    });
  };

  const handleEditClick = (item) => {
    setField(item.fieldValue || item.centerName);
    setUpdateID(item._id);
    setCheckUpdate(true);
    setImageUrl(item.imageUrl);
    setImageName(item.imageName);
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    const tableHeading = { fieldValue: fieldLabel };
    const worksheetData = [Object.values(tableHeading)];
    const formValues = { recsPerPage, pageNumber };

    axios.post(oneField.getListAPI, formValues)
      .then((response) => {
        const downloadData = response.data.tableData;
        downloadData.forEach((row) => {
          worksheetData.push([row.fieldValue || row.centerName]);
        });
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
        XLSX.writeFile(workbook, fieldLabel + ".xlsx");
      })
      .catch((error) => {
        Swal.fire("Error", "Could not export data.");
      });
  };

  return (
    <div className="p-4">
      <div className="admin-box box-primary">
        <div className="admin-box-header border-b border-gray-100 mb-6">
          <h3 className="admin-box-title">{oneField.fieldlabel} Management</h3>
          <div className="flex gap-2">
            <Tooltip
              content={activeTab === "bulk" ? "Go to Form" : "Bulk Upload"}
              placement="bottom"
              arrow={false}
              className="z-50 bg-[#3c8dbc] text-white text-xs px-2 py-1 rounded"
            >
              <button className="flex items-center">
                {activeTab === "failure" ? (
                  <BsPlusSquare
                    className="cursor-pointer text-[#4285F4] text-[28px] hover:scale-110 transition-transform"
                    onClick={() => setActiveTab("active")}
                  />
                ) : (
                  <FaFileUpload
                    className="cursor-pointer text-[#4285F4] text-[28px] hover:scale-110 transition-transform"
                    onClick={() => setActiveTab("failure")}
                  />
                )}
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "active" ? (
            <div className="flex flex-col w-full">
              <form onSubmit={handleSubmit} className="mb-8">
                <div className="flex flex-col lg:flex-row gap-6 items-end">
                  <div className="flex-1 w-full">
                    <label className="admin-label">
                      {oneField.fieldlabel}
                      <span className="text-red-500 ms-1">*</span>
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder={`Enter ${oneField.fieldlabel}`}
                      value={field}
                      required
                      onChange={(e) => {
                        setField(e.target.value);
                        if (errorMessage) setErrorMessage("");
                      }}
                    />
                    {errorMessage && (
                      <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
                    )}
                  </div>
                  <div className="w-full lg:w-auto">
                    <button type="submit" className="admin-btn-primary min-w-[120px]">
                      {checkUpdate ? "Update Record" : "Save Record"}
                    </button>
                  </div>
                </div>
              </form>

              <div className="border-t border-gray-100 pt-8 mt-4">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
                  <div className="flex items-center gap-4">
                    <h3 className="admin-box-title uppercase m-0">{fieldLabel} List</h3>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-gray-500 uppercase">Per Page:</label>
                      <select
                        className="admin-select !w-16 !py-1"
                        onChange={(event) => setRecsPerPage(Number(event.target.value))}
                        value={recsPerPage}
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>

                  <Tooltip
                    content="Download Excel"
                    placement="top"
                    className="z-50 bg-[#3c8dbc] text-white text-xs px-2 py-1 rounded"
                    arrow={false}
                  >
                    <button onClick={exportToExcel} className="p-2 text-[#3c8dbc] hover:bg-blue-50 border border-[#3c8dbc] rounded transition-colors">
                      <FaFileDownload size={20} />
                    </button>
                  </Tooltip>
                </div>

                <div className="overflow-x-auto">
                  <table className="admin-table">
                    <thead className="admin-table-thead">
                      <tr>
                        <th className="admin-table-th w-20 text-center">Sr.No</th>
                        <th className="admin-table-th text-center w-32">Action</th>
                        <th className="admin-table-th">{oneField.fieldlabel}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={3} className="admin-table-td text-center text-[#3c8dbc] py-10">
                            <FaSpinner className="animate-spin text-3xl inline-block" />
                          </td>
                        </tr>
                      ) : data && data.length > 0 ? (
                        data.map((item, index) => (
                          <tr key={item._id || index} className="hover:bg-gray-50 transition-colors">
                            <td className="admin-table-td text-center font-bold">{startSerialNumber + index}</td>
                            <td className="admin-table-td">
                              <div className="flex gap-2 justify-center">
                                <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" onClick={() => handleEditClick(item)}>
                                  <MdOutlineEdit size={18} />
                                </button>
                                <button className="p-1.5 text-red-600 hover:bg-red-50 rounded" onClick={() => handleDelete(item._id)}>
                                  <RiDeleteBin6Line size={18} />
                                </button>
                              </div>
                            </td>
                            <td className="admin-table-td">{item.fieldValue || item.centerName}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="admin-table-td text-center py-10 text-gray-400 font-bold italic">No Record Found!</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {numOfPages.length > 1 && (
                    <div className="flex justify-center mt-8">
                      <ul className="flex items-center gap-1">
                        {pageNumber > 1 && (
                          <li onClick={() => setPageNumber(prev => prev - 1)} className="px-3 py-1 border border-[#d2d6de] cursor-pointer hover:bg-gray-200">
                            <IoIosArrowBack size={18} />
                          </li>
                        )}
                        {numOfPages.map(page => (
                          <li key={page} onClick={() => setPageNumber(page)} className={`px-3 py-1 border border-[#d2d6de] cursor-pointer text-sm font-bold ${pageNumber === page ? "bg-[#3c8dbc] text-white" : "text-gray-600 hover:bg-gray-200"}`}>
                            {page}
                          </li>
                        ))}
                        {pageNumber < numOfPages.length && (
                          <li onClick={() => setPageNumber(prev => prev + 1)} className="px-3 py-1 border border-[#d2d6de] cursor-pointer hover:bg-gray-200">
                            <IoIosArrowForward size={18} />
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
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
    </div>
  );
};

export default OneFieldComponent;
