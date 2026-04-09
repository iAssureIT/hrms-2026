"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
// import html2pdf from "html2pdf.js"; // Moved to dynamic import in handlePrint to fix SSR error
import { useParams, useRouter, usePathname } from "next/navigation";
import Swal from "sweetalert2";
import moment from "moment";
import { Tooltip } from "flowbite-react";
import {
  MdArrowBack,
  MdFileDownload,
  MdCheckCircle,
  MdCancel,
  MdSend,
  MdKeyboardArrowLeft,
  MdChevronRight,
  MdAssignmentTurnedIn,
  MdOutlineFactCheck,
  MdClose,
  MdInfoOutline,
  MdLocationOn,
  MdBusiness,
  MdListAlt,
  MdEdit,
} from "react-icons/md";
import ls from "localstorage-slim";
import { FaUserCircle, FaFileUpload, FaListUl, FaUserPlus } from "react-icons/fa";
import { BsPlusSquare, BsTools } from "react-icons/bs";
import { CiViewList } from "react-icons/ci";

const ViewAsset = () => {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const [assetData, setAssetData] = useState(null);
  const [assetHistory, setAssetHistory] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState("Approve");
  const [remarks, setRemarks] = useState("");
  const [loggedInRole, setLoggedInRole] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const printRef = useRef(null);

  // Re-allocation Form State
  const [centerList, setCenterList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [subLocationList, setSubLocationList] = useState([]);
  const [subDepartmentList, setSubDepartmentList] = useState([]);

  const [formValues, setFormValues] = useState({
    center: "",
    subLocation: "",
    department: "",
    subDepartment: "",
    employeeName: "",
    employeeEmail: "",
    employeeMobile: "",
    employeeDesignation: "",
    inspectionRemarks: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const user = ls.get("userDetails", { decrypt: true });
    setUserDetails(user);
    if (user && user.roles) {
      const roles = user.roles;
      const authorized = roles.includes("admin") || roles.includes("account-admin") || roles.includes("account-manager") || roles.includes("asset-manager") || roles.includes("asset-admin");
      setIsAuthorized(authorized);
    }
  }, []);

  useEffect(() => {
    if (pathname.includes("admin")) {
      setLoggedInRole("admin");
    } else if (pathname.includes("center")) {
      setLoggedInRole("center");
    } else if (pathname.includes("asset")) {
      setLoggedInRole("asset");
    } else if (pathname.includes("account")) {
      setLoggedInRole("account");
    } else {
      setLoggedInRole("executive");
    }
  }, [pathname]);

  useEffect(() => {
    if (params._id) {
      fetchAssetDetails();
    }
  }, [params._id]);

  const fetchAssetDetails = () => {
    setLoading(true);
    axios
      .get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-management-new/get/${params._id}`,
      )
      .then((res) => {
        setAssetData(res.data);
        setRemarks(res.data.reviewRemarks || "");
        setDecision(
          res.data.assetStatus === "ASSET_APPROVAL_REJECTED"
            ? "Reject"
            : "Approve",
        );
        if (res.data.assetStatus === "ALLOCATION_APPROVAL_REJECTED") {
          getCenterList();
          getDepartmentList();
        }

        // Transform statusHistory for the timeline UI
        if (res.data.statusHistory) {
          const transformedHistory = res.data.statusHistory.map((item) => {
            let statusLabel = item.status || item.action;
            let statusColor = "gray";
            let roleTitle = item.action;

            if (statusLabel.includes("REJECTED")) statusColor = "red";
            else if (statusLabel.includes("PENDING")) statusColor = "yellow";
            else if (
              statusLabel.includes("APPROVED") ||
              statusLabel === "ACTIVE" ||
              statusLabel === "ALLOCATED"
            )
              statusColor = "green";

            return {
              ...item,
              statusLabel,
              statusColor,
              roleTitle,
              employeeName: item.performedBy?.firstName
                ? `${item.performedBy.firstName} ${item.performedBy.lastName || ""}`.trim()
                : (item.performedBy?.name || item.userName || "System"),
            };
          });
          setAssetHistory(transformedHistory);
        }
      })
      .catch((err) => {
        console.error("Error fetching asset details:", err);
      })
      .finally(() => {
        setLoading(false);
      });

    // Fetch Maintenance Logs (Optimized Path)
    axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-maintenance/post/list`, {
      "asset_id": params._id,
      recsPerPage: 50,
      pageNumber: 1
    }).then(res => {
      if (res.data && res.data.tableData) {
        setMaintenanceRecords(res.data.tableData);
      }
    }).catch(err => console.error("Error fetching maintenance logs:", err));
  };

  const handleAction = async (status, remarks) => {
    if (!params._id) return;
    setSubmitting(true);
    // Map status to endpoint terms if needed
    const endpoint =
      status === "Active" || status === "APPROVED" || status === "Approve"
        ? "approve"
        : "reject";
    // Map UI status to backend status
    const backendStatus =
      status === "Active" || status === "Approve" || status === "APPROVED"
        ? "APPROVED"
        : status === "Rejected" || status === "REJECTED" || status === "Reject"
          ? "REJECTED"
          : status;
    const type =
      assetData.assetStatus === "ASSET_APPROVAL_PENDING" ||
        assetData.assetStatus === "ASSET_APPROVAL_REJECTED" ||
        assetData.assetStatus === "INACTIVE"
        ? "registry"
        : "allocation";

    if (endpoint === "reject" && !remarks) {
      Swal.fire("Required", "Please enter rejection remarks", "warning");
      setSubmitting(false);
      return;
    }

    try {
      const roles = userDetails?.roles || [];
      const isIncharge = roles.includes("asset-incharge") || roles.includes("center-incharge");

      if (isIncharge && !isAuthorized) {
        Swal.fire("Access Denied", "You do not have permission to perform this action.", "error");
        return;
      }
      setSubmitting(true);

      const user_id = userDetails.user_id || userDetails.userId || userDetails._id;
      const userName = userDetails.firstName ? `${userDetails.firstName} ${userDetails.lastName || ""}`.trim() : (userDetails.fullName || userDetails.name);

      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-transactions/patch/status/${params._id}`,
        {
          remarks,
          user_id,
          userName: userName,
          type,
          status: backendStatus,
        },
      );
      if (res.data.success) {
        Swal.fire(
          "Success!",
          `Asset action processed successfully.`,
          "success",
        );
        fetchAssetDetails();
      }
    } catch (error) {
      console.error("Action error:", error);
      Swal.fire(
        "Error!",
        error.response?.data?.message || "Something went wrong.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeallocate = async () => {
    const { value: deallocationRemark, isConfirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to deallocate this asset from the current employee?",
      icon: "warning",
      input: 'textarea',
      inputPlaceholder: 'Enter deallocation remark here...',
      inputAttributes: {
        'aria-label': 'Type your deallocation remark here'
      },
      showCancelButton: true,
      confirmButtonColor: "#00af50",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, deallocate!",
      inputValidator: (value) => {
        if (!value) {
          return 'Deallocation remark is mandatory!'
        }
      }
    });

    if (isConfirmed && deallocationRemark) {
      const roles = userDetails?.roles || [];
      const isIncharge = roles.includes("account-incharge") || roles.includes("center-incharge");

      if (isIncharge && !isAuthorized) {
        Swal.fire("Access Denied", "You do not have permission to perform deallocations.", "error");
        return;
      }

      setSubmitting(true);
      try {
        const user_id = userDetails.user_id || userDetails._id;
        const userName = userDetails.firstName ? `${userDetails.firstName} ${userDetails.lastName || ""}`.trim() : (userDetails.name);

        const res = await axios.patch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-transactions/patch/deallocate/${params._id}`,
          {
            user_id,
            userName: userName,
            remarks: deallocationRemark
          },
        );
        if (res.data.success) {
          Swal.fire(
            "Success!",
            res.data.message || "Asset deallocated successfully.",
            "success",
          );
          fetchAssetDetails();
        }
      } catch (error) {
        console.error("Deallocation error:", error);
        Swal.fire(
          "Error!",
          error.response?.data?.message || "Something went wrong.",
          "error",
        );
      } finally {
        setSubmitting(false);
      }
    }
  };

  // ── Master Data Fetching ──
  const getCenterList = () => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/centers/list`)
      .then((res) => setCenterList(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Error fetching centers:", err));
  };

  const getSubLocationList = (center_id) => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/location-subcategory/get`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setSubLocationList(
          data.filter((item) => item.dropdown_id === center_id),
        );
      })
      .catch((err) => console.error("Error fetching sub-locations:", err));
  };

  const getDepartmentList = () => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/department-master/get`)
      .then((res) => setDepartmentList(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Error fetching departments:", err));
  };

  const getSubDepartmentList = (dept_id) => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/subdepartment-master/get`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setSubDepartmentList(
          data.filter((item) => item.dropdown_id === dept_id),
        );
      })
      .catch((err) => console.error("Error fetching sub-departments:", err));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));

    if (name === "center") {
      setFormValues((prev) => ({ ...prev, subLocation: "" }));
      if (value) getSubLocationList(value.split("|")[1]);
    }
    if (name === "department") {
      setFormValues((prev) => ({ ...prev, subDepartment: "" }));
      if (value) getSubDepartmentList(value.split("|")[1]);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formValues.center) errors.center = "Center is required";
    if (!formValues.department) errors.department = "Department is required";
    if (!formValues.employeeName) errors.employeeName = "Name is required";
    if (!formValues.employeeEmail) errors.employeeEmail = "Email is required";
    if (!formValues.employeeMobile)
      errors.employeeMobile = "Mobile is required";
    if (formValues.employeeMobile && formValues.employeeMobile.length < 10)
      errors.employeeMobile = "Invalid Mobile";
    if (!formValues.employeeDesignation)
      errors.employeeDesignation = "Designation is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReAllocate = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const employeeData = {
        employeeName: formValues.employeeName,
        employeeEmail: formValues.employeeEmail,
        employeeMobile: formValues.employeeMobile,
        employeeDesignation: formValues.employeeDesignation,
      };
      const empRes = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/employees/post`,
        employeeData,
      );
      const employee_id = empRes.data.employee_id;

      const userDetails = ls.get("userDetails", { decrypt: true }) || {};
      const user_id = userDetails.user_id || userDetails._id;

      const newAllocationData = {
        assetID: assetData.assetID,
        assetName: assetData.assetName,
        allocationType: "ALLOCATE",
        employee: [
          {
            name: formValues.employeeName,
            mobile: formValues.employeeMobile,
            email: formValues.employeeEmail,
            designation: formValues.employeeDesignation,
            employee_id: employee_id,
          },
        ],
        center_id: formValues.center.split("|")[1],
        center: formValues.center.split("|")[0],
        subLocation_id: formValues.subLocation
          ? formValues.subLocation.split("|")[1]
          : null,
        subLocation: formValues.subLocation
          ? formValues.subLocation.split("|")[0]
          : null,
        department_id: formValues.department.split("|")[1],
        department: formValues.department.split("|")[0],
        subDepartment_id: formValues.subDepartment
          ? formValues.subDepartment.split("|")[1]
          : null,
        subDepartment: formValues.subDepartment
          ? formValues.subDepartment.split("|")[0]
          : null,
        inspectionRemarks: formValues.inspectionRemarks,
        createdBy: user_id,
        asset_id: assetData._id,
      };

      const allocRes = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/asset-transactions/`,
        newAllocationData,
      );

      if (allocRes.data.success) {
        Swal.fire("Success!", "Asset re-allocated successfully.", "success");
        fetchAssetDetails();
      }
    } catch (error) {
      console.error("Re-allocation error:", error);
      Swal.fire(
        "Error!",
        error.response?.data?.message || "Something went wrong.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = printRef.current;
    if (!element) return;
    const opt = {
      margin: [0.2, 0.2, 0.2, 0.2],
      filename: `AssetAnalysis_${assetData?.assetID}_${assetData?.assetName}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    // Temporarily hide elements with .no-print before printing
    const noPrintElements = document.querySelectorAll(".no-print");
    noPrintElements.forEach((el) => (el.style.display = "none"));

    html2pdf()
      .from(element)
      .set(opt)
      .save()
      .then(() => {
        noPrintElements.forEach((el) => (el.style.display = ""));
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green"></div>
      </div>
    );
  }

  if (!assetData) {
    return (
      <div className="p-5 text-center text-red-500 font-bold">
        Asset not found.
      </div>
    );
  }

  // Calculation for monthly depreciation (matching AddAsset.js logic)
  const cost = parseFloat(assetData.cost) || 0;
  const resValue = parseFloat(assetData.residualValue) || 0;
  const life = parseInt(assetData.usefulLife) || 0;
  const monthlyDepr =
    life > 0 ? ((cost - resValue) / (life * 12)).toFixed(2) : "0.00";

  const DetailItem = ({ label, value }) => (
    <div className="flex-1 lg:me-4 mb-4">
      <label className="inputLabel text-[14px] text-gray-800 font-bold mb-1 block">{label}</label>
      <div className="relative font-normal text-[15px] text-gray-700 break-words">
        {value || "-"}
      </div>
    </div>
  );

  return (
    <section className="section bg-white p-6">
      <div className="box border-2 rounded-md shadow-md overflow-hidden bg-white">
        {/* Header Section */}
        <div className="border-b-2 border-gray-200 px-10 py-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50/50 gap-4">
          <div className="flex flex-col gap-3">
            <h1 className="mb-0 text-xl font-bold uppercase tracking-wide text-black !px-0 !py-0">
              Asset Analysis:{" "}
              <span className="text-green">{assetData.assetName}</span>
            </h1>
            {/* Unified Status Badge - Positioned under title, flush left */}
            <div
              className={`w-fit px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide border shadow-sm text-center ${assetData.assetStatus === "ALLOCATED" ||
                assetData.assetStatus === "ACTIVE"
                ? "text-green-700 bg-white border-green-500"
                : assetData.assetStatus === "ASSET_APPROVAL_PENDING" ||
                  assetData.assetStatus === "ALLOCATION_APPROVAL_PENDING"
                  ? "text-amber-500 bg-white border-amber-500"
                  : assetData.assetStatus === "ASSET_APPROVAL_REJECTED" ||
                    assetData.assetStatus ===
                    "ALLOCATION_APPROVAL_REJECTED" ||
                    assetData.assetStatus === "INACTIVE"
                    ? "text-red-500 bg-white border-red-500"
                    : assetData.assetStatus === "MAINTENANCE"
                      ? "text-cyan-600 bg-white border-cyan-500"
                      : "text-gray-700 bg-white border-gray-400"
                }`}
            >
              Status:{" "}
              {assetData.assetStatus === "ASSET_APPROVAL_PENDING"
                ? "Asset Approval Pending"
                : assetData.assetStatus === "ACTIVE"
                  ? "Active"
                  : assetData.assetStatus === "ALLOCATION_APPROVAL_PENDING"
                    ? "Allocation Approval Pending"
                    : assetData.assetStatus === "ALLOCATED"
                      ? "Allocated"
                      : assetData.assetStatus === "ASSET_APPROVAL_REJECTED" ||
                        assetData.assetStatus === "INACTIVE"
                        ? "Inactive"
                        : assetData.assetStatus ===
                          "ALLOCATION_APPROVAL_REJECTED"
                          ? "Allocation Rejected"
                          : assetData.assetStatus === "MAINTENANCE"
                            ? "In Maintenance"
                            : assetData.assetStatus}
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-print">
            {/* Allocation Icon (Top Right) - Visible only if Active or ALLOCATION_APPROVAL_REJECTED */}
            {assetData.assetStatus !== "DISPOSED" && !(userDetails?.roles?.includes("fa-accounts")) && (assetData.assetStatus === "ACTIVE" ||
              assetData.assetStatus === "ALLOCATION_APPROVAL_REJECTED") && (
                <div
                  onClick={() =>
                    router.push(
                      `/${loggedInRole}/management/asset-allocation?assetID=${assetData.assetID}`,
                    )
                  }
                  className="text-green border border-green p-1 rounded cursor-pointer hover:bg-green hover:text-white transition-all shadow-sm bg-white flex items-center gap-2 px-3 h-[30px] shrink-0"
                  title={
                    assetData.assetStatus === "ACTIVE"
                      ? "Allocate Asset"
                      : "Reallocate Asset"
                  }
                >
                  <MdAssignmentTurnedIn size={20} />
                  <span className="text-[10px] font-bold uppercase">
                    {assetData.assetStatus === "ACTIVE"
                      ? "Allocate"
                      : "Reallocate"}
                  </span>
                </div>
              )}

            {assetData.assetStatus !== "DISPOSED" && !(userDetails?.roles?.includes("fa-accounts")) && (
              <Tooltip
                content="Add Asset"
                placement="bottom"
                className="bg-green"
                arrow={false}
              >
                <div
                  onClick={() =>
                    router.push(
                      `/${loggedInRole}/management/asset-submission`,
                    )
                  }
                  className="text-green border border-green p-1 rounded cursor-pointer hover:bg-green hover:text-white transition-all shadow-sm bg-white flex items-center justify-center h-[30px] w-[30px] shrink-0"
                >
                  <BsPlusSquare size={18} />
                </div>
              </Tooltip>
            )}

            <Tooltip
              content="Asset List"
              placement="bottom"
              className="bg-green"
              arrow={false}
            >
              <div
                onClick={() =>
                  router.push(`/${loggedInRole}/management`)
                }
                className="text-green border border-green p-1 rounded cursor-pointer hover:bg-green hover:text-white transition-all shadow-sm bg-white flex items-center justify-center h-[30px] w-[30px] shrink-0"
              >
                <CiViewList size={20} />
              </div>
            </Tooltip>

            {assetData.assetStatus !== "DISPOSED" && !(userDetails?.roles?.includes("fa-accounts")) && (
              <Tooltip
                content="Edit Asset"
                placement="bottom"
                className="bg-green"
                arrow={false}
              >
                <div
                  onClick={() =>
                    router.push(
                      `/${loggedInRole}/management/asset-submission/${params._id}`,
                    )
                  }
                  className="text-green border border-green p-1 rounded cursor-pointer hover:bg-green hover:text-white transition-all shadow-sm bg-white flex items-center justify-center h-[30px] w-[30px] shrink-0"
                >
                  <MdEdit size={18} />
                </div>
              </Tooltip>
            )}

            <Tooltip
              content="Download PDF"
              placement="bottom"
              className="bg-green"
              arrow={false}
            >
              <div
                onClick={handlePrint}
                className="text-green border border-green p-1 rounded cursor-pointer hover:bg-green hover:text-white transition-all shadow-sm bg-white flex items-center justify-center h-[30px] w-[30px] shrink-0"
              >
                <MdFileDownload size={20} />
              </div>
            </Tooltip>

            {assetData.assetStatus !== "DISPOSED" && !(userDetails?.roles?.includes("fa-accounts")) && (
              <>
                <Tooltip
                  content="Asset Allocation List"
                  placement="bottom"
                  className="bg-green"
                  arrow={false}
                >
                  <div
                    onClick={() =>
                      router.push(
                        `/${loggedInRole}/management/movement-authorization`,
                      )
                    }
                    className="text-green border border-green p-1 rounded cursor-pointer hover:bg-green hover:text-white transition-all shadow-sm bg-white flex items-center justify-center h-[30px] w-[30px] shrink-0"
                  >
                    <FaListUl size={16} />
                  </div>
                </Tooltip>

                <Tooltip
                  content="Bulk Upload"
                  placement="bottom"
                  className="bg-green"
                  arrow={false}
                >
                  <div
                    onClick={() =>
                      router.push(
                        `/${loggedInRole}/management/bulk-upload`,
                      )
                    }
                    className="text-green border border-green p-1 rounded cursor-pointer hover:bg-green hover:text-white transition-all shadow-sm bg-white flex items-center justify-center h-[30px] w-[30px] shrink-0"
                  >
                    <FaFileUpload size={16} />
                  </div>
                </Tooltip>
              </>
            )}
          </div>
        </div>

        <div className="px-10 py-8" ref={printRef}>
          <div className="mb-0 pb-10 flex flex-col gap-10">
            {/* Merged Core Information Section */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
              {/* Header for Basic Information */}
              <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex items-center">
                <h2 className="text-[12px] font-bold uppercase tracking-widest text-gray-500">
                  Primary Information
                </h2>
              </div>

              <div className="p-8">
                {/* 1. Basic Information Grid */}
                <div className="mb-10">
                  {/* <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 pb-2 border-b border-gray-50">
                    
                  </h4> */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-8">
                    <DetailItem label="Asset Category" value={assetData.category} />
                    <DetailItem label="Asset Sub-Category" value={assetData.subCategory} />
                    <DetailItem label="Asset Name" value={assetData.assetName} />
                    <DetailItem label="Brand" value={assetData.brand} />
                    <DetailItem label="Model / Variation" value={assetData.model} />
                    <DetailItem label="Serial Number" value={assetData.serialNumber} />
                    <DetailItem label="Asset ID" value={assetData.assetID} />
                  </div>
                </div>

                {/* 2. Specifications - Under Basic Info */}
                {assetData.specifications?.length > 0 && (
                  <div className="mb-10">
                    <h4 className="text-[10px] font-bold text-black-400 uppercase tracking-widest mb-6 pb-2 border-b border-gray-50">
                      Technical Specifications
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-4">
                      {assetData.specifications.map((spec, i) => (
                        <div key={i} className="min-w-[150px] bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                          <p className="text-[12px] text-gray-800 font-bold mb-1 block uppercase tracking-wider">
                            {spec.label}
                          </p>
                          <p className="text-[13px] text-gray-400 font-medium break-words">
                            {spec.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Asset Description - Bottom of Core Section */}
                <div className="">
                  <h4 className="text-[12px] font-bold text-black-500 uppercase tracking-widest mb-4 pb-2 border-b border-gray-50">
                    Asset Description
                  </h4>
                  <div className="text-[14px] text-gray-700 font-medium leading-relaxed">
                    {assetData.description || "No description available."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION — Location & Assignment */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden mb-10">
            <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex items-center">
              <h2 className="text-[12px] font-bold uppercase tracking-widest text-gray-500">
                Location & Assignment
              </h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-y-6">
                <DetailItem label="Center Name" value={assetData.currentAllocation?.center?.name} />
                <DetailItem
                  label="Sub-Location"
                  value={assetData.currentAllocation?.subLocation?.name}
                />
                <DetailItem label="Department" value={assetData.currentAllocation?.department?.name} />
                <DetailItem
                  label="Sub-Department"
                  value={assetData.currentAllocation?.subDepartment?.name}
                />
              </div>
            </div>
          </div>

          {/* SECTION — Custodian Details (Visible if Allocated) */}
          {assetData.assetStatus === "ALLOCATED" && assetData.currentAllocation?.employee && (
            <div className="bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden mb-10">
              <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex items-center">
                <h2 className="text-[12px] font-bold uppercase tracking-widest text-gray-500">
                  Custodian / Employee Details
                </h2>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-y-6">
                  <DetailItem label="Employee Name" value={assetData.currentAllocation.employee.name} />
                  <DetailItem label="Employee ID" value={assetData.currentAllocation.employee.employeeID} />
                  <DetailItem label="Contact Number" value={assetData.currentAllocation.employee.mobile} />
                  <DetailItem label="Email Address" value={assetData.currentAllocation.employee.email} />
                  <DetailItem label="Designation" value={assetData.currentAllocation.employee.designation} />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2 — Purchase Details */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden mb-10">
            <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex items-center">
              <h2 className="text-[12px] font-bold uppercase tracking-widest text-gray-500">
                Purchase Details
              </h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-y-8 mb-8">
                <DetailItem
                  label="Purchase Date"
                  value={
                    assetData.purchaseDate
                      ? moment(assetData.purchaseDate).format("DD-MM-YYYY")
                      : "-"
                  }
                />
                <DetailItem
                  label="Invoice Number"
                  value={assetData.invoiceNumber}
                />
                <DetailItem label="Vendor / Supplier" value={assetData.vendor?.name} />
                <DetailItem
                  label="Purchase Cost (INR)"
                  value={assetData.cost ? `₹ ${assetData.cost}` : "0.00"}
                />
                <DetailItem
                  label="Warranty Expiry Date"
                  value={
                    assetData.warrantyDate
                      ? moment(assetData.warrantyDate).format("DD-MM-YYYY")
                      : "-"
                  }
                />
              </div>
            </div>
          </div>

          {/* SECTION 3 — Financial Details */}
          {/* <div className="bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden mb-10">
            <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex items-center">
              <h2 className="text-[12px] font-bold uppercase tracking-widest text-gray-500">
                Financial Details
              </h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-y-6">
                <DetailItem
                  label="Residual Value (INR)"
                  value={
                    assetData.residualValue
                      ? `₹ ${assetData.residualValue}`
                      : "0.00"
                  }
                />
                <DetailItem
                  label="Useful Life (Years)"
                  value={
                    assetData.usefulLife ? `${assetData.usefulLife} Years` : "NA"
                  }
                />
                <DetailItem
                  label="Monthly Depreciation"
                  value={`₹ ${monthlyDepr}`}
                />
              </div>
            </div>
          </div> */}


          {/* Attached Documents */}
          {assetData.uploadedFiles?.length > 0 && (
            <div className="mb-10">
              <h2 className="heading mb-6 border-b pb-2 text-md">
                Attached Documents
              </h2>
              <div className="flex flex-wrap gap-4">
                {assetData.uploadedFiles.map((file, index) => (
                  <a
                    key={index}
                    href={file.fileData}
                    download={file.fileName}
                    className="flex items-center px-4 py-2 border border-green text-green rounded-md text-xs font-bold hover:bg-green hover:text-white transition-all shadow-sm bg-white"
                  >
                    <MdFileDownload size={18} className="mr-2" />
                    {file.fileName}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ──── APPROVAL CARD (ASSET OR ALLOCATION) ──── */}
          {isAuthorized &&
            (assetData.assetStatus === "ASSET_APPROVAL_PENDING" ||
              assetData.assetStatus === "ALLOCATION_APPROVAL_PENDING") && (
              <div className="mt-12 bg-white border border-gray-100 rounded-xl shadow-lg flex flex-col max-w-4xl mx-auto overflow-hidden no-print">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <MdOutlineFactCheck className="text-green-500" />
                      {assetData.assetStatus === "ASSET_APPROVAL_PENDING"
                        ? "Asset Content Approval"
                        : "Allocation Request Approval"}
                    </h3>
                    <span className="px-3 py-1 border border-amber-500 text-amber-500 text-[10px] font-bold uppercase rounded shadow-sm bg-transparent">
                      Pending Review
                    </span>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  {assetData.assetStatus === "ALLOCATION_APPROVAL_PENDING" && (
                    <>
                      {/* Initiator Notes */}
                      <div className="bg-orange-50/30 p-4 border-l-4 border-orange-200 rounded-r-xl">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                          Initiator Notes
                        </p>
                        <p className="text-[12px] text-gray-600 italic leading-relaxed">
                          "{assetData.remarks || "No remarks provided"}"
                        </p>
                      </div>
                    </>
                  )}

                  {/* Checker Remarks (Interactive) */}
                  <div className="">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Checker Remarks
                      </h4>
                      <p className="text-[9px] font-bold text-red-400 uppercase tracking-tighter">
                        * Required for rejection
                      </p>
                    </div>
                    <textarea
                      className="w-full stdSelectField p-4 min-h-[100px] bg-white border-2 border-gray-100 placeholder:text-gray-300 placeholder:italic resize-none focus:border-green-500 font-medium outline-none transition-all"
                      placeholder="Add verification notes or reason for rejection..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6 grid grid-cols-2 gap-6 border-t border-gray-100 bg-gray-50/30">
                  <button
                    onClick={() => handleAction("Rejected", remarks)}
                    disabled={submitting}
                    className="px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <MdClose size={18} />{" "}
                    {submitting
                      ? "Processing..."
                      : assetData.assetStatus === "ASSET_APPROVAL_PENDING"
                        ? "Reject Registry"
                        : "Reject Allocation"}
                  </button>
                  <button
                    onClick={() => handleAction("Active", remarks)}
                    disabled={submitting}
                    className="px-6 py-3 bg-green text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-Green transition-all flex items-center justify-center gap-2 shadow-lg shadow-green/20 disabled:opacity-50"
                  >
                    <MdOutlineFactCheck size={18} />{" "}
                    {submitting
                      ? "Processing..."
                      : assetData.assetStatus === "ASSET_APPROVAL_PENDING"
                        ? "Approve Registry"
                        : "Approve Allocation"}
                  </button>
                </div>
              </div>
            )}

          {/* Bottom Actions - Visible only if Allocated or Inactive/Rejected */}
          {(assetData.assetStatus === "ALLOCATED" ||
            assetData.assetStatus === "INACTIVE" ||
            assetData.assetStatus === "ASSET_APPROVAL_REJECTED") && (
              <div className="mt-12 flex flex-wrap justify-center gap-6 no-print">
                {isAuthorized && (assetData.assetStatus === "INACTIVE" ||
                  assetData.assetStatus === "ASSET_APPROVAL_REJECTED") && (
                    <button
                      onClick={() => handleAction("Active", "Asset activated")}
                      disabled={submitting}
                      className="px-8 py-2 bg-green text-white border border-green rounded font-bold text-xs uppercase tracking-widest hover:bg-Green transition-all flex items-center justify-center gap-2 h-[45px] shadow-sm disabled:opacity-50"
                    >
                      <MdCheckCircle size={18} />{" "}
                      {submitting ? "Processing..." : "Activate Asset"}
                    </button>
                  )}
                {assetData.assetStatus === "ALLOCATED" && (
                  <button
                    onClick={handleDeallocate}
                    disabled={submitting}
                    className="px-8 py-2 bg-red-50 text-red-600 border border-red-200 rounded font-bold text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 h-[45px] min-w-[200px]"
                  >
                    <MdClose size={18} />{" "}
                    {submitting ? "Processing..." : "Deallocate Asset"}
                  </button>
                )}
              </div>
            )}

          {/* ──── MAINTENANCE HISTORY (Best-in-Class Schema) ──── */}
          {maintenanceRecords.length > 0 && (
            <div className="mt-8 border border-gray-100 rounded-xl shadow-lg bg-white max-w-4xl mx-auto overflow-hidden">
              <div className="border-b border-gray-50 p-5 flex items-center bg-gray-50/30">
                <h2 className="text-[12px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <BsTools className="text-gray-400 text-lg" />
                  Technical Service History
                </h2>
              </div>
              <div className="p-8">
                <div className="space-y-6">
                  {maintenanceRecords.map((m, idx) => (
                    <div key={idx} className="bg-gray-50/50 border border-gray-100 rounded-xl p-5 hover:bg-white hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{m.maintenanceID} · {moment(m.issue?.reportedDate).format("DD MMM YYYY")}</p>
                          <h4 className="text-[14px] font-bold text-gray-800">{m.issue?.description}</h4>
                        </div>
                        <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider border ${m.status === "COMPLETED" ? "bg-green-50 text-green-700 border-green-200" :
                          m.status === "IN_PROGRESS" ? "bg-green-50 text-green-600 border-green-200" :
                            "bg-amber-50 text-amber-600 border-amber-200"
                          }`}>
                          {m.status?.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px]">
                        <div>
                          <p className="text-gray-400 font-medium">Vendor</p>
                          <p className="font-bold text-gray-700">{m.vendor?.name || "NA"}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-medium">Total Cost</p>
                          <p className="font-bold text-green">₹ {m.costs?.totalAmount?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-medium">Parts Replaced</p>
                          <p className="font-bold text-gray-700">{m.costs?.spareParts?.length || 0} items</p>
                        </div>
                        <div className="flex items-end justify-end">
                          <button
                            onClick={() => router.push(`/${loggedInRole}/asset-management/maintenance-view/${m._id}`)}
                            className="text-green-500 hover:underline font-bold"
                          >
                            View Report
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ──── WORKFLOW AUDIT HISTORY ──── */}
          <div className="mt-8 border border-gray-100 rounded-xl shadow-lg bg-white max-w-4xl mx-auto overflow-hidden">
            <div className="border-b border-gray-50 p-5 flex items-center bg-gray-50/30">
              <h2 className="text-[12px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <MdListAlt className="text-gray-400 text-lg" />
                Workflow Audit History
              </h2>
            </div>

            <div className="p-8">
              {assetHistory && assetHistory.length > 0 ? (
                <div className="relative pl-6">
                  {/* Vertical tracking line */}
                  <div className="absolute top-4 bottom-4 left-[27px] w-px bg-gray-100"></div>

                  {assetHistory.map((item, index) => {
                    // Determine the icon dynamically based on the exact strict DB status
                    let TimelineIcon = MdCheckCircle;
                    let iconColor = "text-gray-800";
                    if (item.statusLabel?.includes("REJECTED")) {
                      TimelineIcon = MdCancel;
                      iconColor = "text-red-500";
                    } else if (item.statusLabel?.includes("PENDING")) {
                      TimelineIcon = MdInfoOutline;
                      iconColor = "text-yellow-500";
                    } else if (
                      item.statusLabel === "ALLOCATED" ||
                      item.statusLabel?.includes("APPROVED")
                    ) {
                      TimelineIcon = MdCheckCircle;
                      iconColor = "text-green";
                    }

                    if (item.statusLabel === "MAKER") {
                      TimelineIcon = MdListAlt;
                      iconColor = "text-green-500";
                    }

                    return (
                      <div key={index} className="relative mb-10 last:mb-0">

                        {/* Timeline Dot/Icon */}
                        <span className="absolute -left-[42px] top-1 flex items-center justify-center w-8 h-8 bg-white rounded-full border border-gray-200 shadow-sm z-10">
                          {item.isPending ? (
                            <span className="w-3 h-3 bg-gray-300 rounded-full"></span>
                          ) : (
                            <TimelineIcon className={iconColor} size={16} />
                          )}
                        </span>

                        <div className="pl-6">
                          {/* Header Row: Role, Badge, Name */}
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <h4 className="text-[13px] font-bold text-gray-800">{item.roleTitle}</h4>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest
                                ${item.statusColor === 'green' ? 'bg-green-100 text-green-700' :
                                item.statusColor === 'red' ? 'bg-red-100 text-red-700' :
                                  item.statusColor === 'blue' ? 'bg-green-100 text-green-700' :
                                    item.statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-gray-100 text-gray-600'
                              }
                            `}>
                              {item.statusLabel}
                            </span>
                            <span className="text-[11px] text-gray-400 font-medium ml-1 flex items-center gap-1">
                              <span className="w-1 h-1 bg-gray-300 rounded-full inline-block"></span>
                              {item.employeeName}
                            </span>
                          </div>

                          {/* Title and Date */}
                          <div className="mb-3">
                            <h5 className="text-[13px] font-bold text-gray-700">{item.title}</h5>
                            <span className="text-[11px] text-gray-400 font-medium">
                              {item.isPending ? "Pending Action" : moment(item.date).format("MMM DD, YYYY hh:mm A")}
                            </span>
                          </div>

                          {/* Remarks Bubble */}
                          {item.remarks && (
                            <div className="bg-gray-50/80 border border-gray-100 rounded-lg p-3 inline-block">
                              <p className="text-[12px] text-gray-500 italic">"{item.remarks}"</p>
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-center text-gray-400 py-8">No audit history available yet.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ViewAsset;
