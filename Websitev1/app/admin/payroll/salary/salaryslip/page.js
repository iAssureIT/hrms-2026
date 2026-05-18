import SalarySlipPage from "@/widgets/payroll/salary/salaryslip/SalarySlip";

const SalaryStructSlipPage = ({
  searchParams,
}) => {
  return (
    <SalarySlipPage
      empId={searchParams.empId}
    />
  );
};

export default SalaryStructSlipPage;