import AddEmployee from "@/widgets/assetManagement/AddEmployee";
import { Suspense } from "react";

export const metadata = {
  title: "Add/Edit Employee | Lupin MIS",
  description: "Add or edit employee details.",
};

const Page = () => {

  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <AddEmployee />
      </Suspense>
    </div>
  );
};

export default Page;
