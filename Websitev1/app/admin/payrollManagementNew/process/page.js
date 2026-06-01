"use client";

import dynamic from "next/dynamic";

const PayrollMultiStepForm =
  dynamic(
    () =>
      import(
        "@/widgets/payroll/process/Process"
      ),
    {
      ssr: false,
    }
  );

export default function Page() {

  return (
    <PayrollMultiStepForm />
  );
}