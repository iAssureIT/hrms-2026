// "use client";
// import React from "react";
// import Login from "@/widgets/SystemSecurity/Login";

// const LoginPage = () => {
//   const largeImageURL = "/images/specific/Background.webp";
//   const smallImageURL = "/images/specific/Mobile-Background.webp";

//   return (
//     <div
//       className="relative flex-1 flex flex-col bg-cover bg-center lg:bg-[image:var(--largeImageURL)] bg-[image:var(--smallImageURL)]"
//       style={{
//         "--largeImageURL": `url(${largeImageURL})`,
//         "--smallImageURL": `url(${smallImageURL ? smallImageURL : largeImageURL})`,
//         backgroundSize: "100% 100%",
//       }}
//     >
//       <div className="relative flex-1 flex items-start justify-center lg:items-center lg:justify-end w-full px-4 sm:px-8 lg:px-24 xxl:px-32 py-4 lg:py-0">
//         <Login logo="/images/specific/logo.webp" bgColor="bg-white" />
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

import React from "react";
import Login from "@/widgets/SystemSecurity/Login";
import FormBgimage from "@/components/ImageSection/FormBgimage";
const page = () => {
  const largeImageURL = "/images/specific/Background.webp";
  const smallImageURL = "/images/specific/Mobile-Background.webp";

  return (
    <div
      className="fixed inset-0 h-[100dvh] overflow-hidden flex items-center justify-center bg-cover bg-center 
    lg:bg-[image:var(--largeImageURL)]  bg-[image:var(--smallImageURL)]"
      //  style={{ backgroundImage: url(${largeImageURL}) }}
      style={{
        "--largeImageURL": `url(${largeImageURL})`,
        "--smallImageURL": `url(${smallImageURL ? smallImageURL : largeImageURL})`,
        backgroundSize: "100% 100%",
      }}
    >
      <div className="relative flex items-center justify-center lg:justify-end w-full h-full mx-2 sm:mx-10 md:mx-28 xxl:mx-32">
        <Login logo="/images/specific/logo.webp" bgColor="bg-white" />
      </div>
    </div>
  );
};

export default page;
