"use client";
import dynamic from "next/dynamic";
const AddTemplate = dynamic(() => import("@/widgets/NotificationManagement/AddTemplate"), {
  ssr: false,
});

const page = ({ params }) => {
  return (
    <div>
      <AddTemplate template_id={params._id}/>
    </div>
  );
};
export default page;

