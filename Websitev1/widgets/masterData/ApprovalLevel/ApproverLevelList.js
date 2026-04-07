"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter, useParams } from "next/navigation";
import GenericTable from "@/widgets/GenericTable/FilterTable";
import { Tooltip } from "flowbite-react";
import { BsPlusSquare } from "react-icons/bs";
import { FaSpinner } from "react-icons/fa";

function ApprovalLevelList() {
  const [approverLevel, setApproverLevel] = useState("");
  const [maxCost, setMaxCost] = useState("");
  const [approverAuthRole, setApproverAuthRole] = useState("");
  const [approverList, setApproverList] = useState([]);
  const [authourityList, setAuthourityList] = useState([]);
  const [error, setError] = useState({});
  const [approvalSuccessModal, setApprovalSuccessModal] = useState(false);
  const [approvalErrorModal, setApprovalErrorModal] = useState(false);
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

  const params = useParams();
  const router = useRouter();

  const tableHeading = {
    actions: "Actions",
    approverLevel: "Approver Level",
    maxCost: "Approval Limit",
    approverAuthRole: "Approver Authority Name",
  };

  const tableObjects = {
    deleteMethod: "delete",
    getListMethod: "post",
    apiURL: "/api/approvalLevels",
    editURL:
      "/master-data/approval-level-management/approval-level-submission/",
    downloadApply: true,
    searchApply: true,
    showButton: false,
    formURL: "/master-data/approval-level-management/approval-level-submission",
    // formText: "Add Approval Level",
    titleMsg: "Approval Levels",
  };

  const getData = async () => {
    const formValues = {
      searchText,
      recsPerPage,
      pageNumber,
      approverLevel,
      maxCost,
      approverAuthRole,
    };
    setFilterData(formValues);

    try {
      const response = await axios.post(
        "/api/approvalLevels/post/list",
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
    approverLevel,
    maxCost,
    approverAuthRole,
    pageNumber,
    recsPerPage,
    runCount,
    searchText,
  ]);

  useEffect(() => {
    axios
      .get("/api/users/get/list/admin")
      .then((response) => {
        const authorityList = response.data;
        setAuthourityList(Array.isArray(authorityList) ? authorityList : []);
      })
      .catch((error) => console.log("Error fetching authority list:", error));
  }, []);

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 lg:flex lg:justify-between">
            <h1 className="heading h-auto content-center">
              Activity Approval Level List
            </h1>
            <div className="my-2 px-10 lg:px-0 lg:me-10">
              <Tooltip
                content="Add Approval Level"
                placement="bottom"
                arrow={false}
              >
                {loading ? (
                  <FaSpinner className="animate-spin text-center text-green inline-flex mx-2" />
                ) : (
                  <BsPlusSquare
                    className="cursor-pointer text-green hover:text-green border border-green p-0.5 hover:border-green rounded text-[30px] mt-2"
                    onClick={() => {
                      window.open(
                        "/admin/master-data/approval-level-management/approval-level-submission",
                        '_self'
                        // "noopener,noreferrer"
                      );
                    }}
                  />
                )}
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="px-10 py-6">
          <GenericTable
            tableObjects={tableObjects}
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
}

export default ApprovalLevelList;
