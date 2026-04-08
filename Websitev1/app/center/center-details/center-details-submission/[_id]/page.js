import CenterManagement from "@/widgets/masterData/Centers/AddMasterCenter.js";

const page = ({ params }) => {
  return (
    <section className="w-full">
      <CenterManagement center_id={params._id} />
    </section>
  );
};
export default page;
