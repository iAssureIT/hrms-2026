import ViewTemplates from "@/widgets/NotificationManagement/ViewTemplates";

const page = (props) => {
  return (
    <div>
        <ViewTemplates 
            mainTitle= "Email Template"
            templateType= "EMAIL"
        />
    </div>
  );
};
export default page;
