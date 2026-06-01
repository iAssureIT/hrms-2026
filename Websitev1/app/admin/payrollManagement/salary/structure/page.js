import SalaryStructForm from "@/widgets/payroll/salary/structure/SalaryStruct";

const SalaryStructFormPage = ({
  searchParams,
}) => {
  return (
    <SalaryStructForm
      empId={searchParams.empId}
    />
  );
};

export default SalaryStructFormPage;