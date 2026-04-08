import React from "react";
import FormBgimage from "@/components/ImageSection/FormBgimage";
import OTPValidation from "@/widgets/SystemSecurity/ForgotPasswordConfirmOtp";
const page = () => {
  const largeImageURL = "/images/specific/Background.webp";
  const smallImageURL = "/images/specific/Mobile-Background.webp";

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-cover bg-center
     lg:bg-[image:var(--largeImageURL)]  bg-[image:var(--smallImageURL)]" 
    // style={{ backgroundImage: `url(${largeImageURL})` }}
    style={{
      "--largeImageURL": `url(${largeImageURL})`,
      "--smallImageURL": `url(${smallImageURL ? smallImageURL :largeImageURL})`,
      backgroundSize: "100% 100%"
  }}
  >
      <div className="relative flex items-center justify-end w-full h-full mx-28 xxl:mx-32">
        <OTPValidation
        />
      </div>
    </div>
  );
};

export default page;
