import React from "react";

const FormBgimage = (props) => {
  return (
    <div className=" hidden lg:block w-full h-screen">
      <img src={props.image} alt="" className="w-full h-full object-cover" />
    </div>
  );
};

export default FormBgimage;
