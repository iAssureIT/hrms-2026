import BankDetails from "@/widgets/masterData/AddMasterBank.js";

const page = (params) => {
  return (
    <section className="w-full  ">
      {/* <div className="p-7 text-xl ">
        <div className="border-b pb-2 uppercase font-semibold">
          <h1>Bank Details</h1>
        </div>
        <div className="p-7 text-xl "> */}
          <BankDetails bank_id={params._id}/>
        {/* </div>
      </div> */}
    </section>
  );
};
export default page;