"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import GenericTable from "@/widgets/GenericTable/FilterTable";

import { FaSpinner } from "react-icons/fa";

const BankDetailsList = () => {
  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [branchName, setBranchName] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [projectRemark, setProjectRemark] = useState("");

  const [filterData, setFilterData] = useState([]);
  const [runCount, setRunCount] = useState(0);

  const [tableData, setTableData] = useState([]);
  const [recsPerPage, setRecsPerPage] = useState(10);
  const [numOfPages, setNumOfPages] = useState([1]);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchText, setSearchText] = useState("-");
  const [totalRecs, setTotalRecs] = useState("-");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(true);

  //   const [error, setError] = useState({});
  const [accHolderList, setAccHolderList] = useState([]);

  //   const [bankCreateModal, setBankCreateModal] = useState(false);
  //   const [bankUpdateModal, setBankUpdateModal] = useState(false);
  //   const [bankModifyModal, setBankModifyModal] = useState(false);
  //   const [bankExistModal, setBankExistModal] = useState(false);
  //   const [bankDeleteModal, setBankDeleteModal] = useState(false);
  //   const [bankErrorModal, setBankErrorModal] = useState(false);

  const router = useRouter();
  const params = useParams();

  const tableHeading = {
    actions: "Actions",
    accountHolderName: "Account Holder Name",
    bankName: "Bank Name",
    branchName: "Branch",
    ifscCode: "IFSC Code",
    bankAccountNumber: "A/C Number",
    projectRemark: "Project Remark",
  };
  const tableObjects = {
    tableName: "Bank Details",
    deleteMethod: "delete",
    getListMethod: "post",
    apiURL: "/api/bank-details",
    editURL: "/master-data/bank-details/bank-details-submission/",
    searchApply: true,
    downloadApply: true,
    showButton: false,
    formURL: "/master-data/bank-details/bank-details-submission",
    formText: "Add Bank Details",
    titleMsg: "Bank Details",
  };

  const getData = async () => {
    var formValues = {
      searchText: searchText,
      recsPerPage: recsPerPage,
      pageNumber: pageNumber,
      accountHolderName: accountHolderName,
      bankName: bankName,
      branchName: branchName,
      ifscCode: ifscCode,
      bankAccountNumber: bankAccountNumber,
      projectRemark: projectRemark ? projectRemark : "NA",
    };
    setFilterData(formValues);

    try {
      const response = await axios.post(
        "/api/bank-details/post/list",
        formValues
      );
      if (response.data.success) {
        setTotalRecs(response.data.totalRecs);
        setTableData(response.data.tableData);
      } else {
        Swal.fire("Error", response.data.errorMsg, "error");
      }
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    } finally {
      setLoading2(false);
    }
  };

  useEffect(() => {
    getData();
  }, [
    accountHolderName,
    bankName,
    branchName,
    ifscCode,
    bankAccountNumber,
    projectRemark,
    pageNumber,
    recsPerPage,
    runCount,
    searchText,
  ]);

  // let timer;

  // useEffect(() => {
  //     return () => {
  //         clearTimeout(timer);
  //     };
  // }, []);

  useEffect(() => {
    getBankDetailsData();
  }, []);

  const getBankDetailsData = () => {
    axios
      .get("/api/bank-details/list")
      .then((response) => {
        // Accessing the data array directly
        const accHolderList = response.data;

        if (Array.isArray(accHolderList)) {
          setAccHolderList(accHolderList);
        } else {
          console.error("Expected data to be an array but got:", accHolderList);
          setAccHolderList([]);
        }
      })
      .catch((error) => {
        console.log("Error while getting approver List => ", error);
        Swal.fire(" ", "Something went wrong! <br/>" + error.message);
        // setBankErrorModal(true);
      });
  };

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 lg:flex lg:justify-between">
            <h1 className="heading h-auto content-center">Bank Details List</h1>
            <div className="my-2 px-10 lg:px-0 lg:me-10">
              <button
                className="formButtons"
                onClick={() => {
                  // setLoading(true);
                  window.open(
                    "/admin/master-data/bank-details/bank-details-submission",
                    "_blank",
                    "noopener,noreferrer"
                  );
                }}
              >
                {loading ? (
                  <span>
                    {tableObjects.formText}
                    <FaSpinner className="animate-spin text-center text-white inline-flex mx-2" />
                  </span>
                ) : (
                  tableObjects.formText
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="px-10 py-6">
          <GenericTable
            tableObjects={tableObjects ? tableObjects : {}}
            tableHeading={tableHeading}
            setRunCount={setRunCount}
            runCount={runCount}
            recsPerPage={recsPerPage}
            setRecsPerPage={setRecsPerPage}
            filterData={filterData}
            getData={getData}
            tableData={tableData}
            setTableData={setTableData}
            numOfPages={numOfPages}
            setNumOfPages={setNumOfPages}
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
            searchText={searchText}
            setSearchText={setSearchText}
            totalRecs={totalRecs}
            setTotalRecs={setTotalRecs}
            search={search}
            setSearch={setSearch}
            loading={loading2}
          />
        </div>
      </div>
    </section>
  );
};
export default BankDetailsList;
