"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import moment from "moment";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

function ApprovalList() {
  let [approvalList, setApprovalList] = useState([]);

  const router = useRouter();

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    axios
      .get("/api/approval-details/get/list")
      .then((response) => {
        // Accessing the data array directly
        const approvalList = response.data;

        setApprovalList(approvalList);
      })
      .catch((error) => {
        console.log("Error while getting approver List => ", error);
        Swal.fire(
          "Oops!",
          "Something went wrong! <br/>" + error.message,
          "error"
        );
      });
  };

  const redirect = (action, pid) => {
    if (action === "edit") {
      router.push("/admin/approval-management/approval-submission/" + pid);
    }
    if (action === "delete") {
      Swal.fire({
        title: "Are you sure you want to delete this approval?",
        text: "Once deleted, you won't be able to retrieve approval data!",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "No, Don't Delete!",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#50c878",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          axios
            .delete("/api/approval-details/delete/" + pid)
            .then((deletedProduct) => {
              getData();
              Swal.fire({
                title: "Deleted!",
                text: "Your approval details has been deleted.",
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
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire(
            "Approval Details is Safe",
            "Your Approval Details was not deleted.",
            "info"
          );
        }
      });
    }
  };

  return (
    <section>
      <div className="flex justify-end">
        <div className=" h-12 w-full p-2 text-2xl flex justify-center font-bold bg-gray-500">
          Approval List
        </div>
      </div>
      <div className=" border-b-1 border-gray-300 "></div>
      <div className="py-2 text-slate-800 text-sm">
        <div className="overflow-x-auto ">
          <table className="w-full table-auto border-collapse  border border-gray-200">
            <thead>
              <tr className="bg-slate-200 ">
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Program</th>
                <th className="px-4 py-2">Project</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-slate-100 text-center">
              <>
                {Array.isArray(approvalList) && approvalList.length > 0 ? (
                  approvalList.map((product, index) => {
                    return (
                      <tr key={index}>
                        <td className="border px-4 py-2">
                          {moment(product.approvalDate).format("DD/MM/YYYY")}
                        </td>
                        <td className="border px-4 py-2">{product.program}</td>
                        <td className="border px-4 py-2">{product.project}</td>

                        <td className="border px-4 py-2 text-center text-secondary flex justify-content-center">
                          <span
                            className="hover:text-red-500 cursor-pointer"
                            onClick={() => redirect("edit", product._id)}
                          >
                            <FaEdit />
                          </span>{" "}
                          &nbsp;
                          <span
                            className="hover:text-red-500 cursor-pointer"
                            onClick={() => redirect("delete", product._id)}
                          >
                            <MdDelete />
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="12">
                      <h2 className="text-center text-2xl text-red-500 py-20">
                        Loading...
                      </h2>
                    </td>
                  </tr>
                )}
              </>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default ApprovalList;
