"use client";
import dynamic from "next/dynamic";
const AddTemplate = dynamic(() => import("@/widgets/NotificationManagement/AddTemplate"), {
  ssr: false,
});

const page = (props) => {
  return (
    <div>
      <AddTemplate />
    </div>
  );
};
export default page;

