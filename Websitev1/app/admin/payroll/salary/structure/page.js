import SalaryStructForm from "@/widgets/payroll/salary/structure/SalaryStruct__";

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