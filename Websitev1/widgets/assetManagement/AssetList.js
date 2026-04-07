"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { Tooltip } from "flowbite-react";
import GenericTable from "@/widgets/GenericTable/FilterTable";
import { FaFileUpload, FaSpinner } from "react-icons/fa";
import { BsPlusSquare } from "react-icons/bs";
import { usePathname } from "next/navigation";
import {
    MdLayers,
    MdCheckCircle,
    MdCalendarToday,
    MdLocationOn,
    MdOutlineMoveToInbox,
    MdTrendingUp,
    MdAccessTime,
    MdOutlineInventory2
} from "react-icons/md";
import ls from "localstorage-slim";

const MetricCard = ({ title, value, icon: Icon, iconColor, iconBg, onClick, isActive, tooltip }) => (
    <div className="w-full">
        <Tooltip content={tooltip} placement="top" arrow={false} trigger="hover" className="bg-green">
            <div
                onClick={onClick}
                className={`w-full cursor-pointer rounded-xl p-5 shadow-sm border-2 transition-all duration-300 flex items-center justify-between group min-h-[115px] h-full
        ${isActive
                        ? 'border-[#50c878] bg-[#50c878]/5 shadow-md transform -translate-y-1'
                        : 'bg-white border-gray-100 hover:border-[#50c878]/30 hover:shadow-lg hover:-translate-y-1'}`}
            >
                <div className="flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest transition-colors group-hover:text-gray-500">{title}</p>
                    <h2 className="text-2xl font-bold text-gray-800 mt-1">{value}</h2>
                </div>
                <div className={`p-3 rounded-full ${iconBg} ${iconColor} transition-transform duration-300 group-hover:scale-110 ml-4`}>
                    <Icon size={24} />
                </div>
            </div>
        </Tooltip>
    </div>
);

function AssetList() {
    const pathname = usePathname();
    const [loggedInRole, setLoggedInRole] = useState("");
    const [userDetails, setUserDetails] = useState(
        ls.get("userDetails", { decrypt: true })
    );

    const [loading, setLoading] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const [loading3, setLoading3] = useState(true);

    const [tableData, setTableData] = useState([]);
    const [recsPerPage, setRecsPerPage] = useState(10);
    const [numOfPages, setNumOfPages] = useState([1]);
    const [pageNumber, setPageNumber] = useState(1);
    const [searchText, setSearchText] = useState("-");
    const [totalRecs, setTotalRecs] = useState("-");
    const [search, setSearch] = useState("");
    const [runCount, setRunCount] = useState(0);
    const [center_id, setCenter_id] = useState("all");
    const [centerName, setCenterName] = useState("all");
    const [category_id, setCategory_id] = useState("all");
    const [centerNameList, setCenterNameList] = useState([]);
    const [assetCategoryList, setAssetCategoryList] = useState([]);
    const [department_id, setDepartment_id] = useState("all");
    const [subdepartment_id, setSubdepartment_id] = useState("all");
    const [departmentList, setDepartmentList] = useState([]);
    const [subDepartmentList, setSubDepartmentList] = useState([]);
    const [filterData, setFilterData] = useState([]);
    const [counts, setCounts] = useState({ total: 0, allocated: 0, available: 0, pending: 0, rejected: 0 });
    const [activeStatusFilter, setActiveStatusFilter] = useState("all");

    const router = useRouter();

    const tableHeading = {
        actions: "Actions",
        assetName: "Asset Name",
        status: "Status",
        registryStatus: "Registry Status",
        employeeDetails: "Employee Details",
        centerName: "Center",
        sublocationName: "Sub-Location",
        departmentName: "Department",
        subdepartmentName: "Sub-Department",
        assetCategory: "Category",
        assetSubCategory: "Sub-Category",
        brand: "Brand",
        model: "Model",
        serialNo: "Serial No",
        vendor: "Vendor",
        cost: "Cost (USD)",
        purchaseDate: "Purchase Date",
    };

    const tableObjects = {
        tableName: "",
        deleteMethod: "delete",
        getListMethod: "post",
        apiURL: "/api/asset-management",
        editURL: "/asset-management/asset-submission/",
        viewURL: "/asset-management/asset-view/",
        downloadApply: true,
        searchApply: true,
        formURL: "/asset-management/asset-submission",
        formText: "Add Asset",
        titleMsg: "Asset Registry",
    };

    useEffect(() => {
        if (pathname.includes("admin")) {
            setLoggedInRole("admin");
        } else if (pathname.includes("center")) {
            setLoggedInRole("center");
            setCenter_id(userDetails?.center_id || "all");
        } else {
            setLoggedInRole("executive");
        }
        getCenterList();
        getCategoryList();
        getDepartmentList();
    }, [pathname, userDetails]);

    const getCenterList = () => {
        axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/centers/list`)
            .then(res => setCenterNameList(res.data))
            .catch(err => console.error(err));
    };

    const getCategoryList = () => {
        axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-category/get`)
            .then(res => setAssetCategoryList(res.data))
            .catch(err => console.error(err));
    };

    const getData = async () => {
        try {
            setLoading3(true);
            const formValues = {
                searchText: searchText,
                pageNumber: pageNumber,
                recsPerPage: recsPerPage,
                center_ID: center_id,
                department_ID: department_id,
                subdepartment_ID: subdepartment_id,
                dropdown_id: category_id,
                status: activeStatusFilter
            };
            setFilterData(formValues);

            const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-management/post/list`, formValues);
            if (response.data && response.data.tableData) {
                setTableData(response.data.tableData);
                setTotalRecs(response.data.totalRecs);
            } else {
                setTableData([]);
                setTotalRecs(0);
            }
        } catch (error) {
            console.error("Error fetching asset data:", error);
            setTableData([]);
            setTotalRecs(0);
        } finally {
            setLoading3(false);
        }
    };

    useEffect(() => {
        getData();
        getCounts();
    }, [runCount, recsPerPage, pageNumber, center_id, department_id, subdepartment_id, category_id, searchText, activeStatusFilter]);

    const getCounts = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-management/get/dashboard/counts`);
            if (res.data && res.data.success) {
                setCounts(res.data);
            }
        } catch (error) {
            console.error("Error fetching counts:", error);
        }
    };

    useEffect(() => {
        if (department_id && department_id !== "all") {
            getSubDepartmentList(department_id);
        } else {
            setSubDepartmentList([]);
            setSubdepartment_id("all");
        }
    }, [department_id]);

    const getDepartmentList = () => {
        axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/department-master/get`)
            .then(res => {
                setDepartmentList(res.data);
            })
            .catch(err => console.error(err));
    };

    const getSubDepartmentList = (dept_id) => {
        axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/subdepartment-master/get`)
            .then(res => {
                const filtered = res.data.filter(item => item.dropdown_id === dept_id);
                setSubDepartmentList(filtered);
            })
            .catch(err => console.error(err));
    };

    return (
        <section className="section">
            <div className="box border-2 rounded-md shadow-md">
                <div className="uppercase text-xl font-semibold">
                    <div className="border-b-2 border-gray-300 flex justify-between">
                        <h1 className="heading h-auto content-center">Asset Registry List</h1>
                        <div className="flex gap-3 my-5 me-10">
                            <Tooltip
                                content="Bulk Upload"
                                placement="bottom"
                                className="bg-green"
                                arrow={false}
                            >
                                {loading2 ? (
                                    <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                                ) : (
                                    <FaFileUpload
                                        className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                                        onClick={() => {
                                            router.push(`/${loggedInRole}/asset-management/bulk-upload`);
                                        }}
                                    />
                                )}
                            </Tooltip>
                            <Tooltip
                                content="Add Asset"
                                placement="bottom"
                                className="bg-green"
                                arrow={false}
                            >
                                {loading ? (
                                    <FaSpinner className="animate-spin text-center text-Green inline-flex mx-2" />
                                ) : (
                                    <BsPlusSquare
                                        className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                                        onClick={() => {
                                            router.push(`/${loggedInRole}/asset-management/asset-submission`);
                                        }}
                                    />
                                )}
                            </Tooltip>
                        </div>
                    </div>
                </div>
                <div className="px-10 py-6">
                    {/* Dashboard Metric Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-2">
                        <MetricCard
                            title="Total Assets"
                            value={counts.total}
                            icon={MdOutlineMoveToInbox}
                            iconColor="text-green"
                            iconBg="bg-green/10"
                            onClick={() => setActiveStatusFilter("all")}
                            isActive={activeStatusFilter === "all"}
                            tooltip="View All Assets"
                        />
                        <MetricCard
                            title="Allocated"
                            value={counts.allocated}
                            icon={MdTrendingUp}
                            iconColor="text-green"
                            iconBg="bg-green/10"
                            onClick={() => setActiveStatusFilter("active")}
                            isActive={activeStatusFilter === "active"}
                            tooltip="View Allocated Assets"
                        />
                        <MetricCard
                            title="Available"
                            value={counts.available}
                            icon={MdOutlineInventory2}
                            iconColor="text-green"
                            iconBg="bg-green/10"
                            onClick={() => setActiveStatusFilter("available")}
                            isActive={activeStatusFilter === "available"}
                            tooltip="View Available Assets"
                        />
                        <MetricCard
                            title="Pending Approval"
                            value={counts.pending}
                            icon={MdAccessTime}
                            iconColor="text-green"
                            iconBg="bg-green/10"
                            onClick={() => setActiveStatusFilter("pending")}
                            isActive={activeStatusFilter === "pending"}
                            tooltip="View Assets Pending Approval"
                        />
                    </div>

                    {/* Filters Section */}
                    <div className="mt-4 mb-0 lg:mb-5 w-full grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
                        {loggedInRole !== "center" && (
                            <div>
                                <label className="inputLabel">Center</label>
                                <div className="relative mt-2 rounded-md shadow-sm text-gray-500 w-full">
                                    <select
                                        className="stdSelectField pl-3"
                                        value={center_id ? `${center_id}|${centerName}` : "all"}
                                        onChange={(e) => {
                                            if (e.target.value === "all") {
                                                setCenter_id("all");
                                                setCenterName("all");
                                            } else {
                                                const [id, name] = e.target.value.split("|");
                                                setCenter_id(id);
                                                setCenterName(name);
                                            }
                                        }}
                                    >
                                        <option value="all">All</option>
                                        {centerNameList.map((c) => (
                                            <option key={c._id} value={`${c._id}|${c.centerName}`}>{c.centerName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="inputLabel">Asset Category</label>
                            <div className="relative mt-2 rounded-md shadow-sm text-gray-500 w-full">
                                <select
                                    className="stdSelectField pl-3"
                                    value={category_id}
                                    onChange={(e) => setCategory_id(e.target.value)}
                                >
                                    <option value="all">All</option>
                                    {Array.isArray(assetCategoryList) && assetCategoryList.map((cat) => (
                                        <option key={cat._id} value={cat._id}>{cat.fieldValue}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="inputLabel">Department</label>
                            <div className="relative mt-2 rounded-md shadow-sm text-gray-500 w-full">
                                <select
                                    className="stdSelectField pl-3"
                                    value={department_id}
                                    onChange={(e) => setDepartment_id(e.target.value)}
                                // disabled={center_id === "all"}
                                >
                                    <option value="all">All</option>
                                    {departmentList.map((dept) => (
                                        <option key={dept._id} value={dept._id}>{dept.fieldValue}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="inputLabel">Sub-Department</label>
                            <div className="relative mt-2 rounded-md shadow-sm text-gray-500 w-full">
                                <select
                                    className="stdSelectField pl-3"
                                    value={subdepartment_id}
                                    onChange={(e) => setSubdepartment_id(e.target.value)}
                                    disabled={department_id === "all"}
                                >
                                    <option value="all">All</option>
                                    {subDepartmentList.map((sd) => (
                                        <option key={sd._id} value={sd._id}>{sd.inputValue}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <GenericTable
                        tableObjects={tableObjects}
                        tableHeading={tableHeading}
                        setRunCount={setRunCount}
                        runCount={runCount}
                        recsPerPage={recsPerPage}
                        setRecsPerPage={setRecsPerPage}
                        getData={getData}
                        filterData={filterData}
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
                        loading={loading3}
                    />
                </div>
            </div>
        </section>
    );
}

export default AssetList;
