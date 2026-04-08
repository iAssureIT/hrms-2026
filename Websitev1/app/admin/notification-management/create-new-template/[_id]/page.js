import AddTemplate from "@/widgets/NotificationManagement/AddTemplate";

const page = (params) => {
  return (
    <div>
      <AddTemplate template_id={params._id}/>
    </div>
  );
};
export default page;
