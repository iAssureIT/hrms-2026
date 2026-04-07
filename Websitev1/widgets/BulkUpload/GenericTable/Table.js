"use client";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MdClose } from "react-icons/md";
import { Modal, Tooltip } from "flowbite-react";
import * as XLSX from "xlsx";
import {
  faEye,
  faPenToSquare,
  faTrashCan,
  faAngleLeft,
  faAngleRight,
} from "@fortawesome/free-solid-svg-icons";
import { FaUserGraduate, FaCalendarCheck } from "react-icons/fa";
import { SlBookOpen } from "react-icons/sl";
import { IoLocationSharp } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { FaFileDownload } from "react-icons/fa";
import { MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";

const GenericTable = (props) => {
  // console.log("props =>>>",props)
  let router = useRouter();
  const downloadTableName = props.downloadTableName;
  const tableObjects = props.tableObjects;
  const tableName = props.tableName;
  const tableHeading = props.tableHeading;
  const runCount = props.runCount;
  const tableData = props.tableData;
  // const [tableData,setTableData]=useState([]);
  let [recsPerPage, setRecsPerPage] = useState(10);
  let [numOfPages, setNumOfPages] = useState([1]);
  let [pageNumber, setPageNumber] = useState(1);
  let [totalRecs, setTotalRecs] = useState("-");
  let [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState("");
  let [sort, setSort] = useState(true);

  const [checkDelete, setCheckDelete] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteSuccessModal, setDeleteSuccessModal] = useState(false);
  const [deleteFailModal, setDeleteFailModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const startSerialNumber = (pageNumber - 1) * recsPerPage + 1;

  // const { setApprovalId } = useContext(idContext);

  // console.log("propssss",props)

  // useEffect(() => {
  //   // setTableData(props.tableData)
  //   getData();
  // }, [pageNumber, recsPerPage, runCount,props.tableData]);

  useEffect(() => {
    pagesLogic();
  }, [recsPerPage, totalRecs]);

  const pagesLogic = () => {
    let totalPages = Math.ceil(totalRecs / recsPerPage);
    let pageArr = [];
    for (let i = 0; i < totalPages; i++) {
      pageArr[i] = i + 1;
    }
    setNumOfPages(pageArr);
  };

  const getData = () => {
    if (searchText === "") {
      searchText = "-";
    }

    var formValues = {
      center_ID: tableObjects.center_ID,
    };
    axios({
      method: tableObjects.getListMethod,
      url: `${tableObjects.apiURL}/list/${recsPerPage}/${pageNumber}`,
      data: formValues,
    })
      .then((response) => {
        console.log("response.data", response);
        setTotalRecs(response.data.totalRecs);
        // setTableData(response.data.tableData);
      })
      .catch((error) => {
        console.log("Error while getting Users List => ", error);
        setErrorModal(true);
      });
  };

  const deleteData = () => {
    var uid = deleteId;
    axios({
      method: tableObjects.deleteMethod,
      url: `${tableObjects.apiURL}/delete/${uid}`,
    })
      .then((deletedUser) => {
        console.log("deletedUser", deletedUser);
        getData();
        // setDeleteSuccessModal(true);
      })
      .catch((error) => {
        console.log("Error Message from userslist delete redirect  => ", error);
        // setErrorModal(true);
      });
  };

  const redirect = (action, uid) => {
    if (action === "view") {
      router.push("/viewUser/" + uid);
    }
    if (action === "edit") {
      // router.push(tableObjects.editURL + uid)
      window.location.href = tableObjects.editURL + uid;
    }
    if (action === "delete") {
      setDeleteModal(true);

      // Swal.fire({
      //   title: `Are you sure you want to delete this ${tableObjects.deleteMsg} ?`,
      //   text: `Once deleted, you won't be able to retrieve ${tableObjects.deleteMsg} data!`,
      //   icon: "warning",
      //   showCancelButton: true,
      //   cancelButtonText: "No, Don't Delete!",
      //   confirmButtonColor: "#3085d6",
      //   cancelButtonColor: "#50c878",
      //   confirmButtonText: "Yes, delete it!",
      // }).then((result) => {
      //   if (result.isConfirmed) {
      //     axios({
      //       method: tableObjects.deleteMethod,
      //       url: `${tableObjects.apiURL}/delete/${uid}`,
      //     })
      //       .then((deletedUser) => {
      //         console.log("deletedUser", deletedUser);
      //         getData();
      //         Swal.fire({
      //           title: "Deleted!",
      //           text: `Your ${tableObjects.deleteMsg} have been deleted.`,
      //           icon: "success",
      //         });
      //       })
      //       .catch((error) => {
      //         console.log(
      //           "Error Message from userslist delete redirect  => ",
      //           error
      //         );
      //         Swal.fire(
      //           "Oops",
      //           "Something Went Wrong <br/>" + error.message,
      //           "error"
      //         );
      //       });
      //   } else {
      //     Swal.fire({
      //       title: "Ok!",
      //       text: `${tableObjects.deleteMsg} are Safe.`,
      //       icon: "success",
      //     });
      //   }
      // });
    }

    if (action === "approval") {
      setApprovalId(uid);
      localStorage.setItem("approval_id", uid);
      router.push(tableObjects.buttonURL);
    }
  };
  const sortNumber = (key, tableData) => {
    const reA = /[^a-zA-Z]/g;
    const reN = /[^0-9]/g;

    const sortedData = tableData?.sort((a, b) => {
      let nameA = "";
      let nameB = "";
      let aN = 0;
      let bN = 0;

      // Extract values for the given key
      for (const [key1, value1] of Object.entries(a)) {
        if (key === key1) {
          nameA = value1.replace(reA, "");
          aN = parseInt(value1.replace(reN, ""), 10);
        }
      }

      for (const [key2, value2] of Object.entries(b)) {
        if (key === key2) {
          nameB = value2.replace(reA, "");
          bN = parseInt(value2.replace(reN, ""), 10);
        }
      }

      // Compare the values
      if (sort) {
        if (nameA === nameB) {
          return aN - bN;
        } else {
          return nameA.localeCompare(nameB);
        }
      } else {
        if (nameA === nameB) {
          return bN - aN;
        } else {
          return nameB.localeCompare(nameA);
        }
      }
    });

    setSort(!sort);
    // setTableData(sortedData);
  };
  const sortString = (key, tableData) => {
    const sortedData = tableData?.sort((a, b) => {
      let nameA = "";
      let nameB = "";

      Object.entries(a).forEach(([key1, value1]) => {
        if (key === key1) {
          nameA = typeof value1 === "string" ? value1.toUpperCase() : value1;
        }
      });

      Object.entries(b).forEach(([key2, value2]) => {
        if (key === key2) {
          nameB = typeof value2 === "string" ? value2.toUpperCase() : value2;
        }
      });

      if (sort) {
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      } else {
        if (nameA > nameB) return -1;
        if (nameA < nameB) return 1;
        return 0;
      }
    });

    setSort(!sort);
    // setTableData(sortedData);
  };
  const sortData = (event) => {
    event.preventDefault();
    var key = event.target.getAttribute("id");
    if (key === "number") {
      sortNumber(key, tableData);
    } else {
      sortString(key, tableData);
    }
  };

  const exportToExcel_1 = () => {
    // Create a new workbook and a worksheet
    const workbook = XLSX.utils.book_new();
    const worksheetData = [Object.values(tableHeading)];
    const formvalues = { ...filterData, removePagination: true };
    // console.log("formvalues",formvalues)
    axios({
      method: tableObjects?.getListMethod,
      url: `${tableObjects?.apiURL}/post/list`,
      data: formvalues,
    })
      .then((response) => {
        // console.log("response", response);
        var downloadData = response.data.tableData;

        // Add data to the worksheet
        downloadData.forEach((row) => {
          const rowData = Object.keys(tableHeading).map((key) => row[key]);
          worksheetData.push(rowData);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        // Generate Excel file and download
        XLSX.writeFile(workbook, tableName + ".xlsx");
        // XLSX.writeFile(workbook, tableObjects?.titleMsg + ".xlsx");
      })
      .catch((error) => {
        console.log("Error Message from userslist delete redirect  => ", error);
        Swal.fire(" ", "Error Message from userslist delete redirect  =>");
        // setErrorModal(true);
      });
  };

  const exportToExcel = () => {
    // Create a new workbook and a worksheet
    const workbook = XLSX.utils.book_new();
    const worksheetData = [Object.values(tableHeading)];
    // const formvalues = { ...filterData, removePagination: true };
    // console.log("formvalues",formvalues)
    // axios({
    //   method: tableObjects?.getListMethod,
    //   url: `${tableObjects?.apiURL}/post/list`,
    //   data: formvalues,
    // })
    //   .then((response) => {
    //     // console.log("response", response);
        var downloadData = tableData;

        // Add data to the worksheet
        downloadData.forEach((row) => {
          const rowData = Object.keys(tableHeading).map((key) => row[key]);
          worksheetData.push(rowData);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        // Generate Excel file and download
        XLSX.writeFile(workbook, downloadTableName + ".xlsx");
        // })
      // .catch((error) => {
      //   console.log("Error Message from userslist delete redirect  => ", error);
      //   Swal.fire(" ", "Error Message from userslist delete redirect  =>");
      //   // setErrorModal(true);
      // });
  };
  // console.log("tableData",tableData);
  return (
    <section className="">
      <h1 className="text-xl pb-2 font-semibold  mb-2">
        {tableObjects.tableName}
      </h1>

      <div className="">
        <div className="flex flex-row justify-between w-full">
        
          <div className="flex text-sm">
          </div>

          <div className="flex text-sm">
            {tableObjects.searchApply ? (
              <div className="basis-1/3 text-sm -mt-1">             
                <label
                  htmlFor="search"
                  //  className="mb-4 font-semibold"
                  className="inputLabel"
                >
                  Search
                </label>
                <div className="relative mt-2 rounded-md shadow-sm text-gray-500 w-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="pr-2 border-r-2">
                      <FaSearch className="icon" />
                    </span>
                  </div>
                  <input
                    type="text"
                    // className="w-full border mt-2 text-sm ps-1 pb-1"
                    className="stdInputField"
                    placeholder="Search"
                    name="search"
                    onChange={(event) => {
                      console.log("event.target.value => ", event.target.value);
                      setSearch(event.target.value);
                    }}
                  />
                </div>
              </div>
            ) : null}
            {tableObjects.downloadApply ? (
              <div className="ml-4">
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
            ) : null}
          </div>

          {/* <div className="basis-1/3 flex justify-end mt-3">
            {tableObjects?.formText && (
              <button
                className="formButtons flex justify-center"
                onClick={() => {
                  router.push(tableObjects.formURL);
                }}
              >
                {tableObjects.formText}
              </button>
            )}
          </div> */}
        </div>

        <div className="table-responsive overflow-scroll mt-2">
          {/* <table className="table-auto text-sm text-left rtl:text-right  dark: w-full"> */}
          <table className="table-auto text-sm bottom border border-1 border-grayZero w-full dark:w-full">
            <thead className="text-xs border-2 border-grayZero uppercase bg-white dark:bg-white">
              <tr className=" bg-gray-100">
                <th className=" px-4 py-3 bg-white text-center"> Sr. No</th>
                {tableHeading ? (
                  Object.entries(tableHeading).map(([key, value], i) => {
                    if (key === "actions") {
                      return (
                        <th
                          key={i}
                          className="text-left bg-white"
                          id="ActionContent"
                        >
                          {value}
                        </th>
                      );
                    } else {
                      return (
                        <th key={i} className="text-left bg-white">
                          {value}{" "}
                          <span
                            onClick={sortData}
                            id={key}
                            className="fa cursor-pointer fa-sort tableSort"
                          ></span>
                        </th>
                      );
                    }
                  })
                ) : (
                  <th className=""></th>
                )}
              </tr>
            </thead>
            <tbody className=" border-b-2 border-grayZero text-sm">
              {
                tableData && tableData.length > 0 ? (
                  tableData
                    // .filter((user, index) => {
                    //   return (
                    //     search.toLowerCase() === " " ||
                    //     user.firstName.toLowerCase().includes(search) ||
                    //     user.degree.toLowerCase().includes(search) ||
                    //     user.passoutYear.toLowerCase().includes(search) ||
                    //     user.lastName.toLowerCase().includes(search) ||
                    //     user.city.toLowerCase().includes(search) ||
                    //     user.gender.toLowerCase().includes(search) ||
                    //     user.email.toLowerCase().includes(search)
                    //   );
                    // })
                    .map((value, i) => {
                      const serialNumber = startSerialNumber + i;
                      return (
                        <tr
                          key={i}
                          className="border-b border-gray-300 hover:bg-[#f4f4f4] overflow-scroll"
                        >
                          <td className="px-4 py-2 font-normal text-center">
                            {serialNumber}
                          </td>
                          {Object.entries(value).map(([key, value1], i) => {
                            var found = Object.keys(tableHeading).filter(
                              (k) => {
                                return k === key;
                              }
                            );

                            // {console.log(i," | key = ",key, " | value = ",value1)}

                            if (found.length > 0) {
                              if (key !== "id") {
                                return (
                                  <td
                                    className="font-normal px-4 py-2 border-b border-gray-300"
                                    key={i}
                                  >
                                    <div
                                      className={key ===" 'failedRemark' "?" w-[40]": key }
                                      dangerouslySetInnerHTML={{
                                        __html: value1,
                                      }}
                                    ></div>
                                  </td>
                                );
                              }
                            }
                          })}
                          {tableHeading && tableHeading.actions ? (
                            <td className="flex gap-2 justify-center px-4 py-3">
                              <MdOutlineEdit
                                className="border flex justify-center border-gray-500 text-gray-500 p-1 cursor-pointer rounded-sm hover:border-gray-400 hover:text-gray-400"
                                size={"1.3rem"}
                                onClick={() => redirect("edit", value._id)}
                              />
                              &nbsp;
                              <RiDeleteBin6Line
                                className="border flex justify-center border-red-500 text-red-500 p-1 cursor-pointer rounded-sm hover:border-red-400 hover:text-red-400"
                                size={"1.3rem"}
                                onClick={() => {
                                  redirect("delete", value._id);
                                  setDeleteId(value._id);
                                }}
                              />
                              {tableObjects?.showButton ? (
                                <button
                                  className="formButtons px-2  flex justify-center items-center text-xs h-6"
                                  onClick={() => {
                                    redirect("approval", value._id);
                                  }}
                                >
                                  {tableObjects.buttonText}
                                </button>
                              ) : (
                                ""
                              )}
                            </td>
                          ) : null}
                        </tr>
                      );
                    })
                ) : (
                  <tr className="">
                    <td
                      colSpan={
                        tableHeading ? Object.keys(tableHeading).length + 1 : 1
                      }
                      className="text-center"
                    >
                      No Record Found!
                    </td>
                  </tr>
                )

                // ) : (
                //   <tr>
                //     <td colSpan="11">
                //       <h2 className="text-center text-danger py-5  font-semibold ">Data Not Found!</h2>
                //     </td>
                //   </tr>
                // )
              }
            </tbody>
          </table>
          {/* <div className="flex justify-center mt-8">
            <nav aria-label="Page navigation flex">
              <ul className="pagination mx-auto ps-5 flex">
                {pageNumber !== 1 ? (
                  <li
                    className="page-item hover pe-3 border border-gray-400 cursor-pointer text-center border-e-0"
                    onClick={() => setPageNumber(--pageNumber)}
                  >
                    <a className="page-link ">
                      &nbsp; <FontAwesomeIcon icon={faAngleLeft} />
                    </a>
                  </li>
                ) : null}
                {numOfPages.map((item, i) => {
                  return (
                    <li
                      key={i}
                      className={
                        "page-item hover px-3 border border-gray-400 cursor-pointer text-center border-e-0 font-semibold " +
                        (pageNumber === item ? " active" : "")
                      }
                      onClick={() => {
                        setPageNumber(item);
                      }}
                    >
                      <a className="page-link">{item}</a>
                    </li>
                  );
                })}
                {pageNumber !== numOfPages.length ? (
                  <li
                    className="page-item hover px-3 border border-gray-400 cursor-pointer"
                    onClick={() => {
                      setPageNumber(++pageNumber);
                    }}
                  >
                    <a className="page-link ">
                      <FontAwesomeIcon icon={faAngleRight} />
                    </a>
                  </li>
                ) : null}
              </ul>
            </nav>
          </div> */}

          <Modal
            show={deleteModal}
            size="md"
            onClose={() => setDeleteModal(false)}
            popup
          >
            <Modal.Header className="modalHeader justify-end">
              <div
                className="modalCloseButton"
                onClick={() => setDeleteModal(false)}
              >
                <MdClose className="icon text-white font-medium" />
              </div>
            </Modal.Header>
            <Modal.Body>
              <div className="modalBody">
                <h3 className="modalText">
                  Are you sure you want to delete this {tableObjects.deleteMsg}?
                </h3>
                <div className="flex justify-center gap-4">
                  <button
                    className="modalFailBtn"
                    onClick={() => {
                      setDeleteModal(false);
                      setDeleteFailModal(true);
                    }}
                  >
                    No
                  </button>
                  <button
                    className="modalSuccessBtn"
                    onClick={() => {
                      deleteData();
                      setDeleteSuccessModal(true);
                      setDeleteModal(false);
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </Modal.Body>
          </Modal>

          <Modal
            show={deleteSuccessModal}
            size="md"
            onClose={() => setDeleteSuccessModal(false)}
            popup
          >
            <Modal.Header className="modalHeader justify-end">
              <div
                className="modalCloseButton"
                onClick={() => setDeleteSuccessModal(false)}
              >
                <MdClose className="icon text-white font-medium" />
              </div>
            </Modal.Header>
            <Modal.Body>
              <div className="modalBody">
                {/* {Swal.fire({ icon: "success" })} */}
                <h3 className="modalText">
                  {tableObjects.deleteMsg} Deleted Successfully
                </h3>
                <div className="flex justify-center gap-4">
                  <button
                    className="modalSuccessBtn"
                    onClick={() => setDeleteSuccessModal(false)}
                  >
                    Ok
                  </button>
                </div>
              </div>
            </Modal.Body>
          </Modal>

          <Modal
            show={deleteFailModal}
            size="md"
            onClose={() => setDeleteFailModal(false)}
            popup
          >
            <Modal.Header className="modalHeader justify-end">
              <div
                className="modalCloseButton"
                onClick={() => setDeleteFailModal(false)}
              >
                <MdClose className="icon text-white font-medium" />
              </div>
            </Modal.Header>
            <Modal.Body>
              <div className="modalBody">
                {/* {Swal.fire({ icon: "success" })} */}
                <h3 className="modalText">{tableObjects.deleteMsg} are safe</h3>
                <div className="flex justify-center gap-4">
                  <button
                    className="modalSuccessBtn"
                    onClick={() => setDeleteFailModal(false)}
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
                {/* {Swal.fire({ icon: "success" })} */}
                <h3 className="modalText">Oops!</h3>
                <p>Something went wrong</p>
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
        </div>
      </div>
    </section>
  );
};

export default GenericTable;
