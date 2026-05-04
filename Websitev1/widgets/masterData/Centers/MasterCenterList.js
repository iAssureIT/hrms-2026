"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import GenericTable from "@/widgets/GenericTable/FilterTable";
import { Tooltip } from "flowbite-react";
import { FaSpinner, FaFileUpload } from "react-icons/fa";
import { BsPlusSquare } from "react-icons/bs";

const CenterDetailsList = (props) => {
  const [centerName, setCenterName] = useState("");
  const [addressLine, setAddressLine] = useState("");

  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [centerInchargeName, setCenterInchargeName] = useState("");
  const [centerInchargeMobile, setCenterInchargeMobile] = useState("");
  const [centerInchargeEmail, setCenterInchargeEmail] = useState("");
  const [seniorManagerName, setseniorManagerName] = useState("");
  const [seniorManagerMobile, setSeniorManagerMobile] = useState("");
  const [seniorManagerEmail, setSeniorManagerEmail] = useState("");
  const [onRoll, setOnRoll] = useState("");
  const [thirdParty, setThirdParty] = useState("");
  const [totalEmp, setTotalEmp] = useState("");
  //   const [SeniorManagerList, setSeniorManagerList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [filterData, setFilterData] = useState([]);
  const [runCount, setRunCount] = useState(0);

  const [tableData, setTableData] = useState([]);
  const [recsPerPage, setRecsPerPage] = useState(10);
  const [numOfPages, setNumOfPages] = useState([1]);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchText, setSearchText] = useState("-");
  const [totalRecs, setTotalRecs] = useState("-");
  const [search, setSearch] = useState("");
  const [loading3, setLoading3] = useState(false);
  const [loading4, setLoading4] = useState(false);

  const [error, setError] = useState({});

  //   const [centerCreateModal, setCenterCreateModal] = useState(false);
  //   const [centerUpdateModal, setCenterUpdateModal] = useState(false);
  //   const [centerModifyModal, setCenterModifyModal] = useState(false);
  //   const [centerExistModal, setCenterExistModal] = useState(false);
  //   const [centerErrorModal, setCenterErrorModal] = useState(false);

  const router = useRouter();

  const params = useParams();
  const tableHeading = {
    actions: "Actions",
    centerName: "Center Name",
    assetManagementCenterCode: "Asset Management Center Code",
    address: "Address",
    centerInchargeName: "Center Incharge Name",
    centerInchargeMobile: "Center Incharge Mobile",
    centerInchargeEmail: "Center Incharge Email",
    seniorManagerName: "Senior Manager",
    seniorManagerMobile: "Senior Manager Mobile",
    seniorManagerEmail: "Senior Manager Email",
    accountPersonName: "Account Person",
    accountPersonMobile: "Account Person Mobile",
    accountPersonEmail: "Account Person Email",
    onRoll: "On-Roll Staff",
    thirdParty: "Third Party Staff",
    totalEmp: "Total Staff",
  };
  const tableObjects = {
    tableName: "Centers List",
    deleteMethod: "delete",
    getListMethod: "post",
    apiURL: "/api/centers",
    editURL: "/master-data/center-details/center-details-submission/",
    searchApply: true,
    downloadApply: true,
    showButton: false,
    formURL: "/master-data/center-details/center-details-submission",
    formText: "Add Center Details",
    formURL: "Add Center Incharge",
    titleMsg: "Center Details",
  };

  const getData = async () => {
    var formValues = {
      searchText: searchText,
      recsPerPage: recsPerPage,
      pageNumber: pageNumber,
      centerName: centerName,
      addressLine: addressLine,
      district: district,
      state: state,
      pincode: pincode,
      centerInchargeName: centerInchargeName,
      centerInchargeMobile: centerInchargeMobile,
      centerInchargeEmail: centerInchargeEmail,
      seniorManagerName: seniorManagerName,
      seniorManagerMobile: seniorManagerMobile,
      seniorManagerEmail: seniorManagerEmail,
      onRoll: onRoll,
      thirdParty: thirdParty,
      totalEmp: totalEmp,
    };
    setFilterData(formValues);
    try {
      const response = await axios.post("/api/centers/post/list", formValues);
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
    centerName,
    addressLine,
    district,
    state,
    pincode,
    centerInchargeName,
    centerInchargeMobile,
    centerInchargeEmail,
    seniorManagerName,
    seniorManagerMobile,
    seniorManagerEmail,
    onRoll,
    thirdParty,
    totalEmp,
    pageNumber,
    recsPerPage,
    runCount,
    searchText,
  ]);

  useEffect(() => {
    getCentersData();
  }, []);

  const getCentersData = () => {
    axios
      .get("/api/centers/list")
      .then((centerData) => {})
      .catch((error) => {
        console.log("Error while getting List => ", error);
        // Swal.fire(
        //   "Oops!",
        //   "Something went wrong! <br/>" + error.message,
        //   "error"
        // );
        // setCenterErrorModal(true);
      });
  };

  return (
    <section className="section admin-box box-primary">
      <div className="hr-card hr-fade-in">
        {/* Theme-aligned Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-1 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest pl-1 mb-1">
                <span className="text-[#3c8dbc]">Master Data Management</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight pl-1">
                Location <span className="text-[#3c8dbc] font-black">Master</span>
              </h1>
            </div>
            <div className="flex flex-wrap gap-4 pt-4 md:pt-0 mb-1">
              <Tooltip
                content="Geographical Bulk Upload"
                placement="bottom"
                className="bg-[#3c8dbc]"
                arrow={false}
              >
                {loading3 ? (
                  <FaSpinner className="animate-spin text-center text-[#3c8dbc] inline-flex mx-2" />
                ) : (
                  <FaFileUpload
                    className="cursor-pointer text-[#3c8dbc] hover:text-[#367fa9] border border-[#3c8dbc] p-1 hover:border-[#367fa9] rounded text-[30px] transition-all active:scale-95 shadow-sm"
                    onClick={() => {
                      window.open(
                        "/admin/master-data/center-details/add-geographical-data",
                        "_self",
                      );
                    }}
                  />
                )}
              </Tooltip>
              <Tooltip
                content="Add Center Details"
                placement="bottom"
                className="bg-[#3c8dbc]"
                arrow={false}
              >
                {loading4 ? (
                  <FaSpinner className="animate-spin text-center text-[#3c8dbc] inline-flex mx-2" />
                ) : (
                  <BsPlusSquare
                    className="cursor-pointer text-[#3c8dbc] hover:text-[#367fa9] border border-[#3c8dbc] p-1 hover:border-[#367fa9] rounded text-[30px] transition-all active:scale-95 shadow-sm"
                    onClick={() => {
                      window.open(
                        "/admin/master-data/center-details/center-details-submission",
                        "_self",
                      );
                    }}
                  />
                )}
              </Tooltip>
            </div>
          </div>
          <p className="text-slate-500 font-medium max-w-xl text-xs leading-relaxed mt-2 pl-1">
            Comprehensive overview of organizational centers, location-specific data, and administrative oversight.
          </p>
        </div>

        <div className="mt-8">
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
export default CenterDetailsList;
