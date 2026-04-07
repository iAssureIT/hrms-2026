import React from "react";
import Image from "next/image";

const Logo = ({ sidebarData, open, setOpen }) => {
  return (
    <div className={`bg-white hover:bg-gray-50 justify-center sticky top-0`}>
      {open ? (
        <div className="h-[52px] justify-center">
          <Image
            src={sidebarData[0].logoimgfull}
            alt="Full Logo Image"
            className={`h-12 w-40 justify-center mx-auto ${!open && "ps-1"}`}
          />
        </div>
      ) : (
        <div>
          <div className="h-[52px] hidden lg:block">
            <Image
              src={sidebarData[1].logoimgsm}
              alt="Logo"
              className={`h-12 w-12 ms-2 ${!open && ""}`}
            />
          </div>
          <div className="h-[52px] block lg:hidden">
            <Image
              src={sidebarData[0].logoimgfull}
              alt="Logo"
              className={`h-12 w-40 justify-center mx-auto ${!open && ""}`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
