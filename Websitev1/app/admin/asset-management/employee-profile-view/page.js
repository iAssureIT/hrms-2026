import { Suspense } from "react";
import EmployeeProfileView from "@/widgets/assetManagement/EmployeeProfileView";

export const metadata = {
  title: "Employee Profile | Lupin MIS",
  description: "View detailed employee profile and records.",
};

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmployeeProfileView />
    </Suspense>
  );
};

export default Page;
