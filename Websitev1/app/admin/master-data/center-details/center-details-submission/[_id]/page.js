import CenterManagement from "@/widgets/masterData/Centers/AddMasterCenter.js";

const page = ({ params }) => {
  return (
    <section className="w-full">
      {/* <div className="text-xl font-semibold w-full mx-auto"> */}
      <CenterManagement center_id={params._id} />
      {/* </div>
      </div> */}
    </section>
  );
};
export default page;
