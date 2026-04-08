import React from "react";

import AddUtilization from "@/widgets/addUtilization/addUtilization.js";

const Page = (params) => {
  return (
    <section className=" w-full">
      <AddUtilization utilization_id={params._id} />
    </section>
  );
};
export default Page;
