import React from "react";

import ApprovalDetails from "@/widgets/approvalManagement/ApprovalDetails";

const Page = (params) => {
  return (
    <section className="w-full">
      <ApprovalDetails approval_id={params._id} />
    </section>
  );
};
export default Page;
