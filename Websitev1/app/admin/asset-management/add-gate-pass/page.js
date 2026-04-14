"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import AddGatePass from "@/widgets/assetManagement/AddGatePass";

const AddGatePassContent = () => {
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");
  return <AddGatePass editId={editId} />;
};

const AddGatePassPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddGatePassContent />
    </Suspense>
  );
};

export default AddGatePassPage;
