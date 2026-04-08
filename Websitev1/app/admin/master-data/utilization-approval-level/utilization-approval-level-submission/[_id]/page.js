import React from "react";

import AddUtilizationApprovalLevel from "@/widgets/masterData/UtilizationApprovalLevel/AddUtilizationApprovalLevel";

const Page = (params) => {
  return (
    <section>
      <AddUtilizationApprovalLevel level_id={params._id}/>
    </section>
  );
};
export default Page;