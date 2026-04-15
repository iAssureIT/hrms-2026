import HolidayBulkUpload from "@/widgets/holidays/HolidayBulkUpload";

export const metadata = {
  title: "Holiday Bulk Upload | HRMS",
  description: "Bulk upload holidays via Excel/CSV template.",
};

const Page = () => {
  return <HolidayBulkUpload />;
};

export default Page;
