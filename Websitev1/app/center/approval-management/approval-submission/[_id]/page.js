import React from "react";

import AddApproval from "@/widgets/approvalManagement/AddApproval.js";

const Page = (params) => {
  return (
    <section className="w-full">
                <AddApproval approval_id={params._id}/>
    </section>
  );
};
export default Page;