import React from "react";

function Footer() {
  return (
    <section>
      <div className="flex fixed bottom-0 w-full flex-wrap items-center md:justify-between justify-center bg-black h-20">
        <div className="w-full md:w-4/12 mx-auto text-center">
          <div className="text-sm text-white/60 font-semibold py-1">
            Copyright © <span id="get-current-year">2024</span>
            <a
              href="https://www.creative-tim.com/product/notus-js"
              className="text-blueGray-500 hover:text-gray-800"
              target="_blank"
            />{" "}
            iAssureIT &nbsp;
            <span className="text-blueGray-500 hover:text-blueGray-800">
              Made with  &#9829; Siddhant
            </span>
            
          </div>
        </div>
      </div>
    </section>
  );
}

export default Footer;
