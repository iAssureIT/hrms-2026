import AddCCForm from "@/widgets/FundManagement/Add-CC/AddCCForm";

const page = (params) => {
  return (
    <section className="w-full">
      {/* <div className="text-xl font-semibold w-full mx-auto"> */}
      <AddCCForm fund_id={params._id} />
      {/* </div>
      </div> */}
    </section>
  );
};
export default page;
