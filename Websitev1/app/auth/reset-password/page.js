import React from "react";
import FormBgimage from "@/components/ImageSection/FormBgimage";
import ResetPassword from "@/widgets/SystemSecurity/ResetPassword";
const page = () => {
  const largeImageURL = "/images/specific/Background.webp";
  const smallImageURL = "/images/specific/Mobile-Background.webp";

  return (
    <div
      className="fixed inset-0 h-[100dvh] overflow-hidden flex items-center justify-center bg-cover bg-center
      lg:bg-[image:var(--largeImageURL)]  bg-[image:var(--smallImageURL)]"
      //  style={{ backgroundImage: `url(${largeImageURL})` }}

      style={{
        "--largeImageURL": `url(${largeImageURL})`,
        "--smallImageURL": `url(${smallImageURL ? smallImageURL : largeImageURL})`,
        backgroundSize: "100% 100%",
      }}
    >
      <div className="relative flex items-center justify-center lg:justify-end w-full h-full sm:mx-10 md:mx-28 xxl:mx-32">
        <ResetPassword logo="" bgColor="bg-white" />
      </div>
    </div>
  );
};

export default page;
