import React from "react";

import UtilizationDetails from "@/widgets/addUtilization/UtilizationDetails1";

const Page = (params) => {
  return (
    <section className="w-full">
      <UtilizationDetails approval_id={params._id} />
    </section>
  );
};
export default Page;
