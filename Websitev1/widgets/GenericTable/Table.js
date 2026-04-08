"use client";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MdClose } from "react-icons/md";
import { Modal } from "flowbite-react";
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
import validator from "validator";

import { idContext } from "@/context/IdContext";
import { MdOutlineEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";

const GenericTable = (props) => {
  let router = useRouter();

  const tableObjects = props.tableObjects;
  const tableHeading = props.tableHeading;
  const runCount = props.runCount;

  let [tableData, setTableData] = useState([]);
  let [recsPerPage, setRecsPerPage] = useState(10);
  let [numOfPages, setNumOfPages] = useState([1]);
  let [pageNumber, setPageNumber] = useState(1);
  let [selectedPassoutYear, setSelectedPassoutYear] = useState("-");
  let [selectedDegree, setSelectedDegree] = useState("-");
  let [selectedCity, setSelectedCity] = useState("-");
  let [passoutYearOptions, setPassoutYearOptions] = useState([]);
  let [degreeOptions, setDegreeOptions] = useState([]);
  let [cityOptions, setCityOptions] = useState([]);
  let [searchText, setSearchText] = useState("-");
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

  const { setApprovalId } = useContext(idContext);

  // console.log("propssss",props)
  useEffect(() => {
    // getOptions();
    getData();
  }, []);

  useEffect(() => {
    getData();
  }, [pageNumber, recsPerPage, runCount]);

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

  useEffect(() => {
    getData();
    deleteData();
  }, [recsPerPage, runCount]);

  const getData = () => {
    if (searchText === "") {
      searchText = "-";
    }
    // axios
    //   .get(
    //     `api/users/get-userlist/${recsPerPage}/${selectedPassoutYear}/${selectedDegree}/${selectedCity}/${pageNumber}?search=${searchText}`
    //   )
    console.log("table Objects", tableObjects);
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
        setTableData(response.data.tableData);
      })
      .catch((error) => {
        console.log("Error while getting Users List => ", error);
        setErrorModal(true);
      });
  };

  // const getOptions = () => {
  //   axios
  //     .get("api/users/get-options")
  //     .then((optionsList) => {
  //       if (optionsList.data.options) {
  //         setPassoutYearOptions(optionsList.data.options.uniquePassoutYear);
  //         setDegreeOptions(optionsList.data.options.uniqueDegree);
  //         setCityOptions(optionsList.data.options.uniqueCity);
  //       }
  //     })
  //     .catch((error) => {
  //       console.log("Error while getting Options List => ", error);
  //       Swal.fire("Oops!", "Something went wrong! <br/>" + error.message, "error");
  //     });
  // };

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

      Swal.fire({
        title: " ",
        text: `Are you sure you want to delete this ${tableObjects.titleMsg} ? `,
        showCancelButton: true,
        cancelButtonText: "No, Don't Delete!",
        cancelButtonColor: "#50c878",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          axios({
            method: tableObjects.deleteMethod,
            url: `${tableObjects.apiURL}/delete/${uid}`,
          })
            .then((deletedUser) => {
              console.log("deletedUser", deletedUser);
              getData();
              Swal.fire({
                title: " ",
                text: `Your ${tableObjects.titleMsg} have been deleted.`,
              });
            })
            .catch((error) => {
              console.log(
                "Error Message from userslist delete redirect  => ",
                error
              );
              Swal.fire(" ", "Something Went Wrong <br/>" + error.message);
            });
        } else {
          Swal.fire({
            title: " ",
            text: `${tableObjects.titleMsg} are Safe.`,
          });
        }
      });
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
    setTableData(sortedData);
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
    setTableData(sortedData);
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

  const addCommas = (x) => {
    x = x.toString();
    if (x.includes("%")) {
      return x;
    } else {
      if (x.includes(".")) {
        var pointN = x.split(".")[1];
        var lastN = x.split(".")[0];
        var lastThree = lastN.substring(lastN.length - 3);
        var otherNumbers = lastN.substring(0, lastN.length - 3);
        if (otherNumbers !== "") lastThree = "," + lastThree;
        var res =
          otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") +
          lastThree +
          "." +
          pointN;
        // console.log("x",x,"lastN",lastN,"lastThree",lastThree,"otherNumbers",otherNumbers,"res",res)
        return res;
      } else {
        var lastThree = x.substring(x.length - 3);
        var otherNumbers = x.substring(0, x.length - 3);
        if (otherNumbers !== "") lastThree = "," + lastThree;
        var res =
          otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
        // console.log("lastThree",lastThree,"otherNumbers",otherNumbers,"res",res);
        return res;
      }
    }
  };
  return (
    <section className="mt-5 pt-5">
      <h1 className="text-xl pb-2 font-semibold  mb-2">
        {tableObjects.tableName}
      </h1>

      <div className="">
        <div className="flex flex-row mt-2 justify-between w-full">
          <div className="basis-1/3 text-sm">
            <div className="w-1/2">
              <label
                htmlFor="recsPerPage"
                // className="mb-4 font-semibold"
                className="inputLabel"
              >
                Records per Page
              </label>
              <div className="relative mt-2 rounded-md shadow-sm text-gray-500 w-full">
                <select
                  // className="w-full border mt-2 text-sm"
                  // className="stdSelectField py-1.5"
                  className={`${
                    recsPerPage
                      ? "stdSelectField pl-3 w-1/2"
                      : "stdSelectField pl-3 w-1/2"
                  } ${recsPerPage ? "selectOption" : "font-normal"}
              `}
                  onChange={(event) => {
                    setRecsPerPage(event.target.value);
                  }}
                >
                  <option value={10} className="font-normal">
                    10
                  </option>
                  <option value={20} className="font-normal">
                    20
                  </option>
                  <option value={50} className="font-normal">
                    50
                  </option>
                  <option value={100} className="font-normal">
                    100
                  </option>
                </select>
              </div>
            </div>
          </div>

          {tableObjects.searchApply ? (
            <div className="basis-1/3 text-sm -mt-1">
              {/* <label className="mb-4 font-semibold">Search</label>
              <div className="input-group w-full text-center flex flex-row">
                <span 
                className="input-group-text border border-e-0 mt-2 p-1 text-sm "
                
                >
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="w-full border mt-2 text-sm ps-1 pb-1"
                  placeholder="Search by Name"
                  name="search"
                  onChange={(event) => {
                    console.log("event.target.value => ", event.target.value);
                    setSearch(event.target.value);
                  }}
                />
              </div> */}
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

        <div className="table-responsive relative overflow-hidden hover:overflow-auto mt-2 w-full">
          <table className="table-auto text-sm bottom border border-1 border-grayZero w-full dark:w-full">
            <thead className="text-xs border-2 border-grayZero uppercase bg-white dark:bg-white">
              <tr className=" bg-gray-100">
                <th className=" px-4 py-3 bg-white text-left"> Sr. No</th>
                {tableHeading ? (
                  Object.entries(tableHeading).map(([key, value], i) => {
                    if (key === "actions") {
                      return (
                        <th
                          key={i}
                          className="text-center bg-white"
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
                  tableData.map((value, i) => {
                    const serialNumber = startSerialNumber + i;
                    return (
                      <tr
                        key={i}
                        className="border-b border-gray-300 hover:bg-[#f4f4f4]"
                      >
                        <td className="ps-4 py-2 text-left  font-normal">
                          {serialNumber}
                        </td>
                        {Object.entries(value).map(([key, value1], i) => {
                          if (validator.isNumeric(value1.toString())) {
                            var textAlign = "text-left";
                          } else if (validator.isAlpha(value1.toString())) {
                            var textAlign = "text-left";
                          } else if (value1.includes(",")) {
                            var textAlign = "text-left";
                          } else {
                            var textAlign = "text-left";
                          }
                          var found = Object.keys(tableHeading).filter((k) => {
                            return k === key;
                          });

                          // {console.log(i," | key = ",key, " | value = ",value1)}

                          if (found.length > 0) {
                            if (key !== "id") {
                              // if (validator.isNumeric(value1.toString())) {
                              //   var value2=addCommas(value1)
                              // }else{
                              //   var value2= value1
                              // }
                              return (
                                <td
                                  className="py-2 pe-4 border-b border-gray-300"
                                  key={i}
                                >
                                  <div
                                    className={"font-normal  " + textAlign}
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
                          <td className="flex gap-2 justify-center p-4 h-auto">
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
          <div className="flex justify-center mt-8">
            <nav aria-label="Page navigation flex">
              {numOfPages.length > 1 ? (
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
              ) : null}
            </nav>
          </div>

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
                {/* <MdClose className="icon text-white font-medium" /> */}
              </div>
            </Modal.Header>
            <Modal.Body>
              <div className="modalBody">
                <h3 className="modalText">
                  Are you sure you want to delete this {tableObjects.titleMsg}?
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
                {/* <MdClose className="icon text-white font-medium" /> */}
              </div>
            </Modal.Header>
            <Modal.Body>
              <div className="modalBody">
                {/* {Swal.fire({ icon: "success" })} */}
                <h3 className="modalText">
                  {tableObjects.titleMsg} Deleted Successfully
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

          {/* <Modal
            show={deleteFailModal}
            size="md"
            onClose={() => setDeleteFailModal(false)}
            popup
          >
            <Modal.Header className="modalHeader justify-end">
              <div
                className="modalCloseButton"
                onClick={() => setDeleteFailModal(false)}
              > */}
          {/* <MdClose className="icon text-white font-medium" /> */}
          {/* </div>
            </Modal.Header>
            <Modal.Body>
              <div className="modalBody"> */}
          {/* {Swal.fire({ icon: "success" })} */}
          {/* <h3 className="modalText">{tableObjects.deleteMsg} are safe</h3>
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
          </Modal> */}

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
                {/* <MdClose className="icon text-white font-medium" /> */}
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
