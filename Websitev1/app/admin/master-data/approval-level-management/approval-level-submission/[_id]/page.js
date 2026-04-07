import React from "react";

import AddApprovalLevel from "@/widgets/masterData/ApprovalLevel/AddApprovalLevel.js";

const Page = (params) => {
  return (
    <section>
      <AddApprovalLevel level_id={params._id} />
    </section>
  );
};
export default Page;
