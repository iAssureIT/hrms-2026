import React from "react";
import Login from "@/widgets/SystemSecurity/Login";
import FormBgimage from "@/components/ImageSection/FormBgimage";
const page = () => {
  const largeImageURL = "/images/specific/Background.webp";
  const smallImageURL = "/images/specific/Mobile-Background.webp";

  return (
    <div
      className="relative flex-1 flex items-center justify-center bg-cover bg-center 
    lg:bg-[image:var(--largeImageURL)]  bg-[image:var(--smallImageURL)]"
      //  style={{ backgroundImage: url(${largeImageURL}) }}
      style={{
        "--largeImageURL": `url(${largeImageURL})`,
        "--smallImageURL": `url(${smallImageURL ? smallImageURL : largeImageURL})`,
        backgroundSize: "100% 100%",
      }}
    >
      <div className="relative flex-1 flex items-center justify-center lg:justify-end w-full h-full px-2 sm:px-4 lg:px-28 xxl:px-32 py-4 lg:py-0">
        <Login logo="" bgColor="bg-white" />
      </div>
    </div>
  );
};

export default page;
