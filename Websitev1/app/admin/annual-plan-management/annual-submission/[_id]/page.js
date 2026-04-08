import React from "react";
import AddAnnual from "@/widgets/annualPlan/AddAnnual.js";

const Page = (params) => {
  return (
    <section className="w-full">
      <AddAnnual annual_id={params._id}/>
    </section>
  );
};
export default Page;