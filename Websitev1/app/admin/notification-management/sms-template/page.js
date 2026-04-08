import ViewTemplates from "@/widgets/NotificationManagement/ViewTemplates";

const page = (props) => {
  return (
    <div>
        <ViewTemplates 
            mainTitle= "SMS Template"
            templateType= "SMS"
        />
    </div>
  );
};
export default page;
