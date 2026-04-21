"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import swal from "sweetalert2";
import Link from "next/link";
import {
  Card,
  CardBody,
  Typography,
  Tooltip,
  IconButton,
  Chip,
  Input,
} from "@material-tailwind/react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { FaSpinner, FaSearch, FaPlus } from "react-icons/fa";

const ViewTemplates = ({ mainTitle, templateType }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user_id, setUserId] = useState("");
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const parsed = JSON.parse(userDetails);
      setUserId(parsed.user_id);
    }
    getData();
  }, [templateType]);

  const getData = () => {
    setLoading(true);
    axios
      .get(`/api/masternotifications/get/listByType/${templateType}/all`)
      .then((res) => {
        setList(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching templates:", err);
        setLoading(false);
      });
  };

  const deleteTemplate = (id) => {
    swal
      .fire({
        title: "Are you sure?",
        text: "You will not be able to recover this template!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      })
      .then((result) => {
        if (result.isConfirmed) {
          axios
            .delete(`/api/masternotifications/delete/${id}`)
            .then((res) => {
              swal.fire("Deleted!", "Template has been deleted.", "success");
              getData();
            })
            .catch((err) => {
              swal.fire("Error", "Failed to delete template", "error");
            });
        }
      });
  };

  const updateStatus = (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    axios
      .patch("/api/masternotifications/patch/status", {
        notifId: id,
        status: newStatus,
        user_id: user_id,
      })
      .then(() => {
        getData();
      })
      .catch((err) => console.error("Error updating status:", err));
  };

  const filteredList = list.filter(
    (item) =>
      item.templateName?.toLowerCase().includes(filterText.toLowerCase()) ||
      item.event?.toLowerCase().includes(filterText.toLowerCase()),
  );

  return (
    <section className=" section w-full p-6">
      <Card className="shadow-lg border border-gray-200">
        <CardBody>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <Typography variant="h5" color="blue-gray">
              {mainTitle}
            </Typography>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-72">
                <Input
                  label="Search Templates"
                  icon={<FaSearch />}
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </div>
              <Link href="/admin/notification-management/create-new-template">
                <button className="flex items-center gap-2 bg-green text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-semibold">
                  <FaPlus /> Create Template
                </button>
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-max table-auto text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-bold leading-none opacity-70"
                    >
                      Template Name
                    </Typography>
                  </th>
                  <th className="p-4">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-bold leading-none opacity-70"
                    >
                      Event
                    </Typography>
                  </th>
                  <th className="p-4">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-bold leading-none opacity-70"
                    >
                      Role
                    </Typography>
                  </th>
                  <th className="p-4">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-bold leading-none opacity-70"
                    >
                      Status
                    </Typography>
                  </th>
                  <th className="p-4 text-center">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-bold leading-none opacity-70"
                    >
                      Action
                    </Typography>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center">
                      <FaSpinner className="animate-spin text-3xl text-green mx-auto" />
                    </td>
                  </tr>
                ) : filteredList.length > 0 ? (
                  filteredList.map((item, index) => (
                    <tr
                      key={item._id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                    >
                      <td className="p-4">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {item.templateName}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal text-xs uppercase bg-gray-100 px-2 py-1 rounded inline-block"
                        >
                          {item.event}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal capitalize"
                        >
                          {item.role || "All"}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <div
                          className="cursor-pointer"
                          onClick={() => updateStatus(item._id, item.status)}
                        >
                          <Chip
                            variant="ghost"
                            size="sm"
                            value={item.status}
                            color={item.status === "active" ? "green" : "red"}
                          />
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Link
                            href={`/admin/notification-management/create-new-template/${item._id}`}
                          >
                            <Tooltip content="Edit Template">
                              <IconButton variant="text" color="blue">
                                <PencilIcon className="h-4 w-4" />
                              </IconButton>
                            </Tooltip>
                          </Link>
                          <Tooltip content="Delete Template">
                            <IconButton
                              variant="text"
                              color="red"
                              onClick={() => deleteTemplate(item._id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      No templates found for this type.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </section>
  );
};

export default ViewTemplates;
