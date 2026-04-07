/*==========================================================
  Developer  :  Sarika Ghanwat
  Date       :  12st Dec 2023
  ------------------------------------
  Reviewed By:  
  Review Date: 
==========================================================*/

// import React from "react";

// const Footer2 = (props) => {
//   var largeImageURL = props?.inputData?.bgImage;
//   var smallImageURL = props?.inputData?.smallBGImage;
//   return (
//     <section>
//       <div
//         className={
//           props?.inputData?.bgImgCss
//             ? props?.inputData?.bgImgCss
//             : "relative bg-cover p-12 block shadow-lg  bg-no-repeat  max-w-full  sm:bg-cover bg-center  lg:bg-[image:var(--largeImage-url)]  bg-[image:var(--smallImage-url)]"
//         }
//         style={{
//           "--largeImage-url": `url(${largeImageURL})`,
//           "--smallImage-url": `url(${
//             smallImageURL ? smallImageURL : largeImageURL
//           })`,
//           // 'backgroundSize': "100% 100%"
//         }}
//       >
//         <div className="mx-auto w-full max-w-screen-exLG  ">
//           <div className="sm:flex sm:items-center sm:justify-between bg-Blue py-3 p-8">
//             <div className="text-xs md:text-sm xxl:text-sm  sm:text-center ">
//               <span
//                 dangerouslySetInnerHTML={{
//                   __html: props?.inputData?.copyrightText,
//                 }}
//               ></span>
//             </div>
//             {props.inputData.PrivacyPageURL && (
//               <span className=" md:px-10 text-xs md:text-sm xxl:text-sm  sm:text-center  text-black  hover:text-ftLink hover:underline font-medium hover:font-semibold">
//                 <a href={props.inputData.PrivacyPageURL}>Privacy Policy</a>
//               </span>
//             )}
//             <div className="flex mt-0 md:mt-4 space-x-6 sm:justify-center sm:mt-0">
//               <h2
//                 className="text-xs md:text-sm xxl:text-sm sm:text-center  md:flex"
//                 dangerouslySetInnerHTML={{
//                   __html: props.inputData.footerText,
//                 }}
//               ></h2>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Footer2;






//Nehas code
import React from "react";

const Footer2 = (props) => {
  var largeImageURL = props?.inputData?.bgImage;
  var smallImageURL = props?.inputData?.smallBGImage;
  return (
    <section>
      <div
        className={
          props?.inputData?.bgImgCss
            ? props?.inputData?.bgImgCss
            : "relative bg-cover p-12 block shadow-lg  bg-no-repeat  max-w-full  sm:bg-cover bg-center  lg:bg-[image:var(--largeImage-url)]  bg-[image:var(--smallImage-url)]"
        }
        style={{
          "--largeImage-url": `url(${largeImageURL})`,
          "--smallImage-url": `url(${
            smallImageURL ? smallImageURL : largeImageURL
          })`,
          // 'backgroundSize': "100% 100%"
        }}
      >
        <div className="mx-auto w-full max-w-screen-exLG  ">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-y-2 bg-Blue py-4 px-6 sm:px-8">
            <div className="text-[11px] md:text-sm xxl:text-sm text-center sm:text-left">
              <span
                dangerouslySetInnerHTML={{
                  __html: props?.inputData?.copyrightText,
                }}
              ></span>
            </div>
            {props.inputData.PrivacyPageURL && (
              <span className="text-[11px] md:text-sm xxl:text-sm text-center text-blue-600 underline font-semibold hover:text-blue-800">
                <a href={props.inputData.PrivacyPageURL}>Privacy Policy</a>
              </span>
            )}
            <div className="flex mt-0 space-x-0 sm:space-x-6 justify-center sm:mt-0">
              <h2
               className="hidden sm:flex text-xs md:text-sm xxl:text-sm sm:text-center"
                dangerouslySetInnerHTML={{
                  __html: props.inputData.footerText,
                }}
              ></h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Footer2;
