import React from "react";
//import ComingSoon from "@/components/ComingSoon/ComingSoon.js";
import RoleManagement from "@/widgets/UserManagement/AddRole.js";

const RoleManagementPage = () => {
  return (
    <section className="section h-full">
      <div className="box border-2 rounded-md shadow-md h-fit">
      
            <div className='border-b uppercase '>
            <h1 className="heading">Role Management</h1>
            </div>
            <div className='p-10 flex text-xl font-semibold justify-center max-w-3xl mx-auto'>
                <RoleManagement />
            </div>
        </div>
    </section>
  );
};

export default RoleManagementPage;
