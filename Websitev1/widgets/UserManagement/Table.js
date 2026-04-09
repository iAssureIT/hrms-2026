"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
const twoFieldInputObj = {
  insertAPI: "/api/items",
  editAPI: "/api/items",
  deleteAPI: "/api/items",
  getListAPI: "/api/items",
};
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
  const startSerialNumber = (pageNumber - 1) * recsPerPage + 1;

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
        Swal.fire(" ", "Something went wrong! <br/>" + error.message);
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

  const redirect = (action, uid) => {
    if (action === "view") {
      router.push("/viewUser/" + uid);
    }
    if (action === "edit") {
      // router.push(tableObjects.editURL + uid)
      window.location.href = tableObjects.editURL + uid;
    }
    if (action === "delete") {
      Swal.fire({
        title: `Are you sure you want to delete this ${tableObjects.titleMsg} ?`,
        text: `Once deleted, you won't be able to retrieve ${tableObjects.titleMsg} data!`,
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "No, Don't Delete!",
        confirmButtonColor: "#3085d6",
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
                title: "Deleted!",
                text: `Your ${tableObjects.titleMsg} have been deleted.`,
                icon: "success",
              });
            })
            .catch((error) => {
              console.log(
                "Error Message from userslist delete redirect  => ",
                error
              );
              Swal.fire(
                "Oops",
                "Something Went Wrong <br/>" + error.message,
                "error"
              );
            });
        } else {
          Swal.fire({
            title: "Ok!",
            text: `${tableObjects.titleMsg} are Safe.`,
            icon: "success",
          });
        }
      });
    }
  };

  const sortString = (key, tableData) => {
    var nameA = "";
    var nameB = "";
    var sortedData = tableData.sort((a, b) => {
      Object.entries(a).map(([key1, value1], i) => {
        if (key === key1) {
          if (jQuery.type(value1) === "string") {
            nameA = value1.toUpperCase();
          } else {
            nameA = value1;
          }
        }
      });
      Object.entries(b).map(([key2, value2], i) => {
        if (key === key2) {
          if (jQuery.type(value2) === "string") {
            nameB = value2.toUpperCase();
          } else {
            nameB = value2;
          }
        }
      });
      if (this.state.sort === true) {
        this.setState({
          sort: false,
        });
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      } else if (this.state.sort === false) {
        this.setState({
          sort: true,
        });
        if (nameA > nameB) {
          return -1;
        }
        if (nameA < nameB) {
          return 1;
        }
        return 0;
      }
    });
    setTableData(sortedData);
  };
  const sort = (event) => {
    event.preventDefault();
    var key = event.target.getAttribute("id");
    if (key === "number") {
      sortNumber(key, tableData);
    } else {
      sortString(key, tableData);
    }
  };
  return (
    <section className="mt-5 pt-5">
      <h1 className="text-xl pb-2 font-semibold  mb-2">
        {tableObjects.tableName}
      </h1>

      <div className="">
        <div className="flex flex-row mt-2">
          <div className="basis-1/3 text-sm">
            <label htmlFor="recsPerPage" className="mb-4 font-semibold">
              Records per Page
            </label>
            <div className="relative mt-2 rounded-md shadow-sm text-gray-500 w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm pr-2 border-r-2">
                  <SlBookOpen size={20} />
                </span>
              </div>
              <select
                // className="w-full border mt-2 text-sm"
                className="stdSelectField "
                onChange={(event) => {
                  setRecsPerPage(event.target.value);
                }}
              >
                <option value={10}>10 Records</option>
                <option value={20}>20 Records</option>
                <option value={50}>50 Records</option>
                <option value={100}>100 Records</option>
              </select>
            </div>
          </div>
          <div className="basis-1/3"></div>
          {tableObjects.searchApply ? (
            <div className="basis-1/3">
              <label className="mb-4 font-semibold">Search</label>
              <div className="input-group w-full text-center flex flex-row">
                <span className="input-group-text border border-e-0 mt-2 p-1 text-sm ">
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
              </div>
            </div>
          ) : null}
        </div>

        <div className="py-2 table-responsive overflow-scroll mt-6">
          {/* <table className="table-auto text-sm text-left rtl:text-right  dark: w-full"> */}
          <table className="table-auto text-sm text-center bottom border border-1 dark: w-full">
            <thead className="text-xs border-2 border-gray-200 uppercase bg-gray-50 dark:bg-gray-700 dark:">
              <tr className=" bg-gray-100">
                <th className=" px-4 py-3"> Sr. No</th>
                {tableHeading ? (
                  Object.entries(tableHeading).map(([key, value], i) => {
                    if (key === "actions") {
                      return (
                        <th key={i} className="text-center" id="ActionContent">
                          {value}
                        </th>
                      );
                    } else {
                      return (
                        <th key={i} className="text-center">
                          {value}{" "}
                          <span
                            onClick={sort}
                            id={key}
                            className="fa fa-sort tableSort"
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
            <tbody className=" border-b-2 border-gray-400 text-sm">
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
                          className="border-b border-gray-300 hover:bg-gray-100 overflow-scroll"
                        >
                          <td className="px-4 py-2 ">{serialNumber}</td>
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
                                    className="px-4 py-2 border-b border-gray-300"
                                    key={i}
                                  >
                                    <div
                                      className=""
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
                            <td className="flex justify-center gap-1 px-4 py-2">
                              <FontAwesomeIcon
                                icon={faPenToSquare}
                                className="hover:text-blue-800 text-green-600 cursor-pointer text-sm pt-1 ps-1"
                                onClick={() => redirect("edit", value._id)}
                              />
                              &nbsp;
                              <FontAwesomeIcon
                                icon={faTrashCan}
                                className="hover:text-red-800 text-red-600 cursor-pointer text-sm pt-1 ps-1"
                                onClick={() => redirect("delete", value._id)}
                              />
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default GenericTable;
