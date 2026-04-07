import React from "react";
import FormBgimage from "@/components/ImageSection/FormBgimage";
import SignUp from "@/widgets/SystemSecurity/SignUP";

const page = () => {
  return (
    <div className="flex bg-white py-5">
      <FormBgimage image="/images/generic/Sign_Up_image.jpg" />
      <SignUp
        logo="/images/specific/Logo.jpg"
        style="sm:w-3/4 md:w-1/2 xl:w-2/3 px-5 bg-white-100 shadow-xl mx-auto  py-10"
        bgColor="bg-white"
      />
    </div>
  );
};

export default page;
