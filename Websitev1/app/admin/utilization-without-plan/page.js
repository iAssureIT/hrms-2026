"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import GenericReport from "@/widgets/reports/ReportTable";

const UtilizationWithoutPlan = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [center_id, setCenter_id] = useState("all"); 
   const [centerName, setCenterName] = useState("all");
  
  const [centerNameList, setCenterNameList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [recsPerPage, setRecsPerPage] = useState(10);
  const [numOfPages, setNumOfPages] = useState([1]);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchText, setSearchText] = useState("-");
  const [totalRecs, setTotalRecs] = useState("-");
  const [search, setSearch] = useState("");
    const [filterData, setFilterData] = useState([]);
  
  const twoLevelHeader = {
    apply: true,
    firstHeaderData: [
      {
        heading: "Master Details",
        mergedColoums: 6,
        hide: true,
      },
      {
        heading: "Utilization Details",
        mergedColoums: 11,
        hide: false,
      },
    ],
  };
  const tableHeading = {
    centerName: 'Center',
    program: 'Program',
    project: 'Project',
    activityName: 'Activity',
    subactivityName: 'Sub-Activity',
    voucherDate: 'Voucher Date',
    voucherNumber: 'Voucher No',
    unit: 'Unit',
    quantity: 'Qty',
    unitCost: 'Unit Cost',
    totalCost: 'Total Cost',
    sourceofFund: 'Fund Source',
    convergence: 'Convergence',
    noOfHouseholds: 'Households',
    noOfBeneficiaries: 'Beneficiaries',
    status: 'Status',
  };


  const tableObjects = {
    tableName: "",
    deleteMethod: "delete",
    getListMethod: "post",
    center_ID: "all",
    apiURL: "api/reports/post/without-plan",
    searchApply: false,
    downloadApply: true,
    buttonText: "Utilization",
    showButton: false,
    titleMsg: "Utilization without Plan",
  };
  const getData = async () => {
    try {
      setLoading(true);
 var formValues = {
      searchText: searchText,
      recsPerPage: recsPerPage,
      pageNumber: pageNumber,
      center_id: center_id,
    };
    setFilterData(formValues);
      const response = await axios.post('/api/reports/post/without-plan',formValues);

      if (response.data.success) {
        setTotalRecs(response.data.totalRecs);
        setTableData(response.data.tableData);
      } else {
        console.log(response.data.errorMsg);
        setTotalRecs(0);
        setTableData([]);
      }
    } catch (error) {
      console.error('Error fetching utilization data:', error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    getData();
  }, [
    center_id,
    pageNumber,
    recsPerPage,
    searchText,
  ]);

  const getCenterNameList = () => {
    axios
      .get("/api/centers/list")
      .then((response) => {
        const CenterNameList = response.data;

        if (Array.isArray(CenterNameList)) {
          // console.log("Setting CenterNameList:", CenterNameList);
          setCenterNameList(
            CenterNameList.sort((a, b) => {
              return a.centerName.localeCompare(b.centerName);
            })
          );
        } else {
          console.error(
            "Expected data to be an array but got:",
            CenterNameList
          );
          setCenterNameList([]);
        }
      })
      .catch((error) => {
        console.log("Error while getting CenterName List => ", error);
      });
  };
  
    useEffect(() => {
      getCenterNameList();
    }, []);
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Utilizations With No Matching Plans</h2>
              <div className="">
                <label htmlFor="centerName" className="inputLabel">
                  Center
                </label>
                <div className="relative mt-2 rounded-md shadow-sm text-gray-500">
                  <select
                    name="centerName"
                    id="centerName"
                    className="stdSelectField  pl-3"
                    value={center_id ? `${center_id}|${centerName}` : ""}
                    onChange={(e) => {
                      const [center_id, centerName] = e.target.value.split("|");
                      setCenterName(centerName);
                      setCenter_id(center_id);
                    }}
                  >
                    <option value="" disabled className="text-gray-400">
                      -- Select Center --
                    </option>
                    <option value="all">All</option>
                    {centerNameList?.map((center, i) => (
                      <option
                        className="text-black"
                        key={i}
                        value={`${center._id}|${center.centerName}`}
                      >
                        {center.centerName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
     
        <div className="overflow-x-auto">
           
          <GenericReport
            tableObjects={tableObjects ? tableObjects : {}}
            twoLevelHeader={twoLevelHeader}
            tableHeading={tableHeading}
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
            loading={loading}
          />
        </div>
    </div>
  );
};

export default UtilizationWithoutPlan;
