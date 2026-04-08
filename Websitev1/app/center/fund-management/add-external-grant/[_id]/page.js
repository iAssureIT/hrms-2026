import AddExternalGrant from "@/widgets/FundManagement/Add-External-Grant/ExternalGrantForm";

const page = (params) => {
  return (
    <section className="w-full">
      {/* <div className="text-xl font-semibold w-full mx-auto"> */}
      <AddExternalGrant fund_id={params._id} />
      {/* </div>
      </div> */}
    </section>
  );
};
export default page;
