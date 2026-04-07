import React from "react";

import UtilizationApprovalLevelDetails from "@/widgets/masterData/UtilizationApprovalLevel/UtilizationAprrovalLevelDetails";

const Page = (params) => {
  return (
    <section className="w-full">
      <UtilizationApprovalLevelDetails approval_id={params._id} />
    </section>
  );
};
export default Page;
