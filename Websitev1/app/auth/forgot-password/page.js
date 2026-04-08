import React from "react";
import ForgotPassword from "@/widgets/SystemSecurity/ForgotPassword";
import FormBgimage from "@/components/ImageSection/FormBgimage";
const page = () => {
  const largeImageURL = "/images/specific/Background.webp";
  const smallImageURL = "/images/specific/Mobile-Background.webp";

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center
    lg:bg-[image:var(--largeImageURL)]  bg-[image:var(--smallImageURL)]"
      // style={{ backgroundImage: `url(${largeImageURL})` }}
      style={{
        "--largeImageURL": `url(${largeImageURL})`,
        "--smallImageURL": `url(${smallImageURL ? smallImageURL : largeImageURL})`,
        backgroundSize: "100% 100%",
      }}
    >
      <div className="relative flex items-center justify-center lg:justify-end w-full h-full mx-2 sm:mx-10 md:mx-28 xxl:mx-32">
        <ForgotPassword
          logo="/images/Logo.jpg"
          style="sm:w-3/4 md:w-1/2 xl:w-2/3 bg-white-100 px-5 -xl border rounded-lg mx-auto my-10 py-10 xxl:py-20"
          bgColor="bg-white"
        />
      </div>
    </div>
  );
};

export default page;
