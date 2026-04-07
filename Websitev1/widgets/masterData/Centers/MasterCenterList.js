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
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 lg:flex lg:justify-between">
            <h1 className="heading h-auto content-center">
              Center Details List
            </h1>

            <div className="flex gap-3 my-5 me-10">
              <Tooltip
                content="Geographical Bulk Upload"
                placement="bottom"
                className="bg-green"
                arrow={false}
              >
                {loading3 ? (
                  <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                ) : (
                  <FaFileUpload
                    className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                    onClick={() => {
                      // setLoading3(true);
                      window.open(
                        "/admin/master-data/center-details/add-geographical-data",
                        '_self'
                        // "noopener,noreferrer"
                      );
                    }}
                  />
                )}
              </Tooltip>
              <Tooltip
                content="Add Center Details"
                placement="bottom"
                className="bg-green"
                arrow={false}
              >
                {loading4 ? (
                  <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                ) : (
                  <BsPlusSquare
                    className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                    onClick={() => {
                      // setLoading4(true);
                      window.open(
                        "/admin/master-data/center-details/center-details-submission",
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
