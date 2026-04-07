"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Modal, Tooltip } from "flowbite-react";
import { MdClose } from "react-icons/md";
import validator from "validator";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { usePathname } from "next/navigation";
import { MdOutlineEdit } from "react-icons/md";

import "animate.css";

import { IoLocationOutline } from "react-icons/io5";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdOutlineEmail } from "react-icons/md";
import { IoPersonCircleOutline } from "react-icons/io5";
import { HiBuildingOffice2 } from "react-icons/hi2";
import { FaMobileAlt } from "react-icons/fa";
import { Md123 } from "react-icons/md";
import GenericTable from "@/widgets/GenericTable/FilterTable";
import { CiViewList } from "react-icons/ci";
import { MdLocationOn } from "react-icons/md";
import { FaSpinner } from "react-icons/fa6";
import { FaUsers } from "react-icons/fa6";

const districtList = ["Pune", "Nashik", "Mumbai"];
const stateList = ["Maharashtra", "Karnataka", "Goa"];

const CenterProfile = () => {
  const pathname = usePathname();
  const [loggedInRole, setLoggedInRole] = useState("");
  const [centerData, setCenterData] = useState([]);
  const [geographicalData, setGeographicalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(false);
  const [items, setItems] = useState([]);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    getCenterData();
    if (pathname.includes("admin")) {
      setLoggedInRole("admin");
    } else if (pathname.includes("center")) {
      setLoggedInRole("center");
    } else {
      setLoggedInRole("executive");
    }
  }, []);

  const getCenterData = () => {
    console.log("params._id", params._id);
    axios
      .get("/api/centers/get/one/" + params._id)
      .then((response) => {
        setCenterData(response.data[0]);
        console.log("response center profile", response);
        // setGeographicalData(response.data[0].villagesCovered);

        // Function to organize the data

        const organizedVillagesCovered = organizeVillagesCovered(
          response.data[0].villagesCovered
        );

        setGeographicalData(organizedVillagesCovered);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const organizeVillagesCovered = (villagesCovered) => {
    const organizedData = {};

    villagesCovered.forEach(({ district, block, village }) => {
      if (!organizedData[district]) {
        organizedData[district] = {};
      }
      if (!organizedData[district][block]) {
        organizedData[district][block] = new Set();
      }
      organizedData[district][block].add(village);
    });

    Object.keys(organizedData).forEach((district) => {
      Object.keys(organizedData[district]).forEach((block) => {
        organizedData[district][block] = Array.from(
          organizedData[district][block]
        );
      });
    });

    return organizedData;
  };

  // const organizeVillagesCovered = (villagesCovered) => {
  //   const organizedData = {};

  //   villagesCovered.forEach(({ district, block, village }) => {
  //     if (!organizedData[district]) {
  //       organizedData[district] = {};
  //     }

  //     if (!organizedData[district][block]) {
  //       organizedData[district][block] = new Set();
  //     }

  //     organizedData[district][block].add(village);
  //   });

  //   Object.keys(organizedData).forEach((district) => {
  //     Object.keys(organizedData[district]).forEach((block) => {
  //       organizedData[district][block] = Array.from(
  //         organizedData[district][block]
  //       );
  //     });
  //   });

  //   return organizedData;
  // };

  // const mappVar=centerData.villagesCovered;

  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading">Center Details</h1>
            <div className="flex gap-3 my-6 me-10">
              {loggedInRole === "admin" ? 
                <Tooltip
                  content="Center Details List"
                  placement="bottom"
                  className="bg-green"
                  arrow={false}
                >
                  {loading2 ? (
                    <FaSpinner className="animate-spin inline-flex mx-2 text-Green" />
                  ) : (
                    <CiViewList
                      className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                      onClick={() => {
                        window.open(
                          "/admin/master-data/center-details/center-details-list",
                          '_self'
                          // "noopener,noreferrer"
                        );
                        // setLoading2(true);
                      }}
                    />
                  )}
                </Tooltip>
                : null
              }
              &nbsp;
              {loggedInRole === "admin" || loggedInRole === "center"  ?  
              <Tooltip
                  content="Edit"
                  placement="bottom"
                  className="bg-green"
                  arrow={false}
                >
                  {loading2 ? (
                    <FaSpinner className="animate-spin inline-flex mx-2 text-Green" />
                  ) : (
                    <MdOutlineEdit
                      className="cursor-pointer text-green hover:text-Green border border-green p-0.5 hover:border-Green rounded text-[30px]"
                      size={"1.3rem"}
                      onClick={() => {
                        window.open(
                          "/"+loggedInRole+"/center-details/center-details-submission/"+params._id,
                          '_self'
                          // "noopener,noreferrer"
                        );
                        // setLoading2(true);
                      }}                  
                    />
                  )}
                </Tooltip>
                : null
              }
            </div>
          </div>
        </div>
        <div className="px-10 py-6">
          <div>
            <div className="relative mt-2 font-semi-bold text-lg text-green underline">
              {centerData?.centerName ? (
                centerData?.centerName
              ) : (
                <FaSpinner className="animate-spin inline-flex mx-2 text-Green" />
              )}{" "}
              Center
              {/* {centerData?.centerName} Center */}
            </div>
          </div>
          <div className=" mb-5 flex lg:flex-row md:flex-col flex-col mt-10">
            <div className="flex-1 lg:me-4">
              <label htmlFor="centerName" className="inputLabel flex">
                <span className="mt-1">
                  <MdLocationOn className="icon me-0.5" />
                </span>
                Address <br />
              </label>
              {loading ? (
                <FaSpinner className="animate-spin inline-flex mx-2 text-Green" />
              ) : (
                <div className="relative mt-2 font-normal text-black text-[15px]">
                  {centerData?.address?.addressLine +
                    ", " +
                    centerData?.address?.district +
                    ", " +
                    centerData?.address?.state +
                    ", " +
                    centerData?.address?.pincode}
                  {/* {centerData?.address?.addressLine + address?.district + address?.state + address?.pincode} */}
                </div>
              )}
            </div>
          </div>
          <div className=" mb-5 flex lg:flex-row md:flex-col flex-col mt-10">
            <div className="flex-1 ">
              <label htmlFor="centerName" className="inputLabel flex">
                <span className="mt-1">
                  <FaUsers className="icon me-1" />
                </span>
                On-Roll Staff
              </label>
              <div className="relative mt-2 font-normal text-black text-[15px]">
                {loading ? (
                  <FaSpinner className="animate-spin inline-flex mx-2 text-Green" />
                ) : (
                  centerData?.onRoll
                )}
              </div>
            </div>
            <div className="flex-1 ">
              <label htmlFor="centerName" className="inputLabel flex">
                <span className="mt-1">
                  <FaUsers className="icon me-1" />
                </span>
                Third Party Staff
              </label>
              <div className="relative mt-2 font-normal text-black text-[15px]">
                {loading ? (
                  <FaSpinner className="animate-spin inline-flex mx-2 text-Green" />
                ) : (
                  centerData?.thirdParty
                )}
              </div>
            </div>
            <div className="flex-1 ">
              <label htmlFor="centerName" className="inputLabel flex">
                <span className="mt-1">
                  <FaUsers className="icon me-1" />
                </span>
                Total Staff
              </label>
              <div className="relative mt-2 font-normal text-black text-[15px]">
                {loading ? (
                  <FaSpinner className="animate-spin inline-flex mx-2 text-Green" />
                ) : (
                  centerData?.totalEmp
                )}
              </div>
            </div>
          </div>
          <div className="relative overflow-x-auto  mx-auto  border-3 mb-10 rounderd-md mt-10">
            <div className="subHeading">Center Management Details</div>
            {loading ? (
              <div className="text-center bg-grayOne py-3">
                <FaSpinner className="animate-spin inline-flex mx-2 text-Green" />
              </div>
            ) : centerData ? (
              <table className="w-full border-separate border-spacing-y-2 text-sm  rtl:text-right  text-gray-500 dark:text-gray-400w-full min-w-max table-auto text-left">
                <thead className="text-xs text-gray-700  uppercase  px-10 dark:text-gray-400  border border-grayTwo">
                  <tr className="font-bold text-gray-900 whitespace-nowrap dark:text-white py-4">
                    <th className="py-4 ps-4 border border-grayTwo border-r-0 font-semibold">
                      Designation
                    </th>
                    <th className="py-4 ps-4 border border-grayTwo border-r-0 font-semibold">
                      Name
                    </th>
                    <th className="py-4 ps-4 border border-grayTwo border-r-0 font-semibold">
                      Mobile
                    </th>
                    <th className="py-4 ps-4 border border-grayTwo  font-semibold">
                      Email
                    </th>
                  </tr>
                </thead>
                <tr className="odd:bg-grayOne odd:dark:bg-gray-900 even:bg-gray-50 border border-grayTwo  text-gray-900 font-normal">
                  <td className="py-4 ps-4 font-normal border border-grayTwo border-r-0">
                    Center Incharge
                  </td>
                  <td className="py-4 ps-4 font-normal border border-grayTwo border-r-0">
                    {centerData?.centerInchargeDetails?.Name}
                  </td>
                  <td className="py-4 ps-4 font-normal border border-grayTwo border-r-0">
                    {centerData?.centerInchargeDetails?.mobileNumber}
                  </td>
                  <td className="py-4 ps-4 font-normal border border-grayTwo ">
                    {centerData?.centerInchargeDetails?.email}
                  </td>
                </tr>
                <tr className="odd:bg-grayOne odd:dark:bg-gray-900 even:bg-gray-50 border border-grayTwo  text-gray-900 font-normal">
                  <td className="py-4 ps-4 font-normal border border-grayTwo border-r-0">
                    Senior Manager
                  </td>
                  <td className="py-4 ps-4 font-normal border border-grayTwo border-r-0">
                    {centerData?.seniorManagerDetails?.Name}
                  </td>
                  <td className="py-4 ps-4 font-normal border border-grayTwo border-r-0">
                    {centerData?.seniorManagerDetails?.mobileNumber}
                  </td>
                  <td className="py-4 ps-4 font-normal border border-grayTwo ">
                    {centerData?.seniorManagerDetails?.email}
                  </td>
                </tr>
              </table>
            ) : (
              <div className="text-center font-medium text-[15px] bg-grayOne py-3">
                No Record Found
              </div>
            )}
          </div>
          <div className="relative overflow-x-auto  mx-auto  border-3 mb-10 rounderd-md mt-10">
            <div className="subHeading">Geographic Data</div>
            {geographicalData && Object.entries(geographicalData).length > 0 ? (
              <table className="w-full border-separate border-spacing-y-2 text-sm  rtl:text-right  text-gray-500 dark:text-gray-400w-full min-w-max table-auto text-left">
                <thead className="text-xs text-gray-700  uppercase  px-10 dark:text-gray-400  border border-grayTwo">
                  <tr className="font-bold text-gray-900 whitespace-nowrap dark:text-white py-4">
                    <th className="py-4 ps-4 border border-grayTwo border-r-0 font-semibold">
                      District
                    </th>
                    <th className="py-4 ps-4 border border-grayTwo border-r-0 font-semibold">
                      Block
                    </th>
                    <th className="py-4 ps-4 border border-grayTwo  font-semibold">
                      Villages
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(geographicalData).map(([district, blocks]) =>
                    Object.entries(blocks).map(([block, villages], index) => (
                      <tr
                        key={`${district}-${block}`}
                        className="odd:bg-grayOne odd:dark:bg-gray-900 even:bg-gray-50 border border-grayTwo text-gray-900 font-normal"
                      >
                        {index === 0 && (
                          <td
                            rowSpan={Object.keys(blocks).length}
                            className="py-4 ps-4 font-normal border border-grayTwo align-top"
                          >
                            {district}
                          </td>
                        )}
                        <td className="py-4 ps-4 font-normal border border-grayTwo border-r-0 border-l-0 align-top">
                          {block} {`(${villages.length})`}
                        </td>
                        <td className="py-4 ps-4 font-normal border border-grayTwo">
                          {villages.map((village, index) => {
                            return (
                              <div key={village}>
                                {`${++index})`} &nbsp;
                                {village}
                              </div>
                            );
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : loading ? (
              <div className="text-center bg-grayOne py-3">
                <FaSpinner className="animate-spin inline-flex mx-2 text-Green" />
              </div>
            ) : (
              <div className="text-center font-medium text-[15px] bg-grayOne py-3">
                No Record Found
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CenterProfile;
