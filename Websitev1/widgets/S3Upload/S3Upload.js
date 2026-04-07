// import { Tooltip } from "flowbite-react";
// import { useEffect, useState } from "react";
// import { FaRegFileAlt } from "react-icons/fa";
// import { IoMdCloseCircle } from "react-icons/io";
// import S3FileUpload from "react-s3";
// import Swal from "sweetalert2";

// const S3UploadComponent = ({
//   setDocumentName,
//   documentName,
//   documentUrl,
//   setDocumentUrl,
// }) => {
//   const [s3Url, setS3Url] = useState([]);
//   const [uploadFileName, setUploadFileName] = useState([]);
//   const [validationError, setValidationError] = useState("");

//   const s3Config = {
//     bucketName: process.env.NEXT_PUBLIC_BUCKET_NAME,
//     region: process.env.NEXT_PUBLIC_REGION,
//     accessKeyId: process.env.NEXT_PUBLIC_ACCESS_KEY,
//     secretAccessKey: process.env.NEXT_PUBLIC_SECRET_KEY,
//   };

//   // console.log('Creating config',s3Config);
//   // useEffect(() => {
//   //   setS3Url(documentUrl);
//   //   setUploadFileName(documentName);

//   // console.log("Uploading image...", s3Url, fileName);
//   // }, [documentUrl, documentName]);

//   // const handleFileChange = (event) => {
//   //   const file = event.target.files[0];
//   //   if (file) {
//   //     const filename = file.name;
//   //     const fileType = file.type;
//   //     const fileSize = file.size;
//   //     const fileExtension = filename.split(".").pop().toLowerCase();

//   //     // Validate file size (must be below 20 KB)
//   //     if (fileSize > 20480) {
//   //       setValidationError("File size must be below 20 KB.");
//   //       return;
//   //     }

//   //     // Validate file format (must be webp)
//   //     if (fileExtension !== "webp") {
//   //       setValidationError("File format must be webp.");
//   //       return;
//   //     }

//   //     // Validate image dimensions (must be 100x100)
//   //     const img = new window.Image();
//   //     img.onload = () => {
//   //       if (img.width !== 100 || img.height !== 100) {
//   //         setValidationError("Image dimensions must be 100x100.");
//   //       } else {
//   //         uploadFileToS3(file);
//   //       }
//   //     };
//   //     img.onerror = () => {
//   //       setValidationError("Invalid image file.");
//   //     };
//   //     img.src = URL.createObjectURL(file);
//   //   }
//   // };

//   // const handleFileChange = (event) => {
//   //   const file = event.target.files[0];
//   //   const fileName = file.name;
//   //   const fileType = file.type;
//   //   const fileSize = file.size;
//   //   const fileExtension = fileName.split(".").pop();
//   //   // console.log("fileName => ", fileName);
//   //   // console.log("fileType => ", fileType);
//   //   // console.log("fileSize => ", fileSize);
//   //   // console.log("fileExtension => ", fileExtension);

//   //   S3FileUpload.uploadFile(file, s3Config)
//   //     .then((data) => {
//   //       console.log("data => ", data);
//   //       setS3Url(data.location);
//   //       setDocumentName(data.key);
//   //       setDocumentUrl(data.location);
//   //       setUploadFileName(data.key);
//   //     })
//   //     .catch((err) => console.error(err));

//   //   // console.log("s3url => ", s3Url);
//   //   // console.log("FileName => ", fileName);
//   // };

//   const handleFileChange = (event) => {
//     console.log("Hello inside S3");
//     event.preventDefault();
//     var image = [];
//     console.log("event.currentTarget.files", event.currentTarget.files);
//     if (event.currentTarget.files && event.currentTarget.files[0]) {
//       for (var i = 0; i < event.currentTarget.files.length; i++) {
//         var file = event.currentTarget.files[i];
//         if (file) {
//           var fileName = file.name;
//           var fileSize = file.size;
//           var ext = fileName.split(".").pop();
//           if (
//             ext === "jpg" ||
//             ext === "png" ||
//             ext === "jpeg" ||
//             ext === "JPG" ||
//             ext === "PNG" ||
//             ext === "JPEG" ||
//             ext === "WEBP" ||
//             ext === "webp" ||
//             ext === "pdf" ||
//             ext === "docx"
//           ) {
//             if (fileSize > 1048576) {
//               Swal.fire("Allowed file size is 1MB", "error");
//             } else {
//               if (file) {
//                 var objTitle = { fileInfo: file };
//                 // setImage(objTitle);
//                 image.push(objTitle);
//               } else {
//                 Swal.fire("File not uploaded");
//               }
//             }
//           } else {
//             Swal.fire(
//               "oops",
//               "Allowed file formats are (jpg, png, jpeg, webp)",
//               "error"
//             );
//             Swal.fire(
//               "Not Supported!",
//               "Allowed file formats are (jpg, png, jpeg, webp, pdf and docx)",
//               "error"
//             );
//           } //file types
//         } //file
//       } //for
//       if (event.currentTarget.files) {
//         main(image).then((formValues) => {
//           setS3Url((prevImages) => [...prevImages, ...formValues.fileUrls]);
//           setUploadFileName((prevNames) => [
//             ...prevNames,
//             ...formValues.fileNames,
//           ]);
//           setDocumentUrl((prevImages) => [
//             ...prevImages,
//             ...formValues.fileUrls,
//           ]);
//           setDocumentName((prevNames) => [
//             ...prevNames,
//             ...formValues.fileNames,
//           ]);
//           // console.log("formValues",formValues);
//           //   setFileUrl(formValues.image)
//           //   console.log("New File URl", fileUrl)
//           // setDelFile(formValues.image);
//         });
//       }
//     }
//     async function main() {
//       var formValues = null;
//       let fileUrls = [];
//       let fileNames = [];
//       // for (var j = 0; j < image.length; j++) {
//       // const config = {
//       //   bucketName: process.env.BUCKETNAME,
//       //   // dirName: response.data.dir,
//       //   region: process.env.REGION,
//       //   accessKeyId: process.env.ACCESSKEYID,
//       //   secretAccessKey: process.env.SECRETACCESSKEY,
//       // };
//       var s3url = await s3upload(image[0]?.fileInfo, s3Config, this);
//       console.log("s3url", s3url);
//       console.log("fghghfgfh", image[0].fileInfo.name);
//       fileNames.push(image[0].fileInfo.name);
//       fileUrls.push(s3url);
//       const formValue = {
//         fileUrls: fileUrls,
//         fileNames: fileNames,
//         status: "New",
//       };
//       formValues = formValue;
//       console.log("HEyyyy", formValues.fileUrls);
//       // setFileUrl(formValues.image)
//       return Promise.resolve(formValues);
//     }
//     function s3upload(image, configuration) {
//       console.log("image", image);
//       console.log("configuration", configuration);
//       return new Promise(function (resolve, reject) {
//         S3FileUpload.uploadFile(image, configuration)
//           .then((Data) => {
//             resolve(Data.location);
//           })
//           .catch((error) => {
//             console.log("error", error);
//           });
//       });
//     }
//   };

//   const uploadFileToS3 = (file) => {
//     S3FileUpload.uploadFile(file, s3Config)
//       .then((data) => {
//         console.log("data", data.key);
//         setS3Url(data.location);
//         setDocumentName(data.key);
//         setDocumentUrl(data.location);
//         setUploadFileName(data.key);

//         setValidationError("");
//       })
//       .catch((err) => console.error(err));
//   };

//   // console.log("filename", fileName);

//   const handleDeleteFile = (index) => {
//     // setUploadFileName((prevImages) => {
//     //   return prevImages.filter((_, i) => i !== index);
//     // });
//     // setDocumentName((prevName) => {
//     //   return prevName.filter((_, i) => i !== index);
//     // });
//     // S3FileUpload.deleteFile(fileName, s3Config)
//     //   .then((response) => {
//     //     setS3Url((prevFileNames) =>
//     //       prevFileNames.filter((name) => name !== fileName)
//     //     );
//     //     setDocumentUrl((prevFileNames) =>
//     //       prevFileNames.filter((name) => name !== fileName)
//     //     );
//     //     setS3Url("");
//     //     setUploadFileName("");
//     //     setDocumentUrl("");
//     //     setDocumentName("");
//     //   })
//     //   .catch((err) => {
//     //     console.error("Error deleting file:", err);
//     //   });
//   };

//   return (
//     <section>
//       <div className="mt-2">
//         {/* {s3Url ? ( */}
//         <>
//           {/* <div className="-mt-8 w-34">
//               <div className="W-25 flex justify-end mt-3 relative top-2.5 -right-3.5 z-10">
//                 <IoMdCloseCircle
//                   className="flex justify-center cursor-pointer text-red-500 -z-30 mt-1"
//                   size={"1.5rem"}
//                   onClick={() => {
//                     handleDeleteFile(uploadFileName);
//                   }}
//                 />
//               </div>
//               <div className="ps-7"> */}
//           {/* <img
//                   src={s3Url}
//                   alt="Uploaded"
//                   className="z-30 "
//                   style={{
//                     maxWidth: "50%",
//                     marginLeft: "25px",
//                   }}
//                 /> */}
//           {/* <FaRegFileAlt className="text-3xl text-Green content-center z-[1]" />
//               </div>
//             </div> */}

//           <div class="font-medium text-gray-600 text-md flex items-center">
//             {s3Url && s3Url.length > 0
//               ? s3Url.map((url, index) => {
//                   return (
//                     <div className="w-full flex mt-2">
//                       <div className="flex items-center">
//                         <div className="text-center border border-dashed border-gray-400 p-3 rounded-md relative">
//                           <IoMdCloseCircle
//                             onClick={() => {
//                               handleDeleteFile(url);
//                             }}
//                             className="hover:text-red-600 cursor-pointer absolute top-[-5px] right-[-5px] text-red-500 bg-white text-[18px] z-[2]"
//                           />

//                           <div className="flex justify-center relative">
//                             <FaRegFileAlt className="text-2xl text-black content-center z-[1]" />
//                           </div>
//                           <div className="w-fit h-fit content-center flex overflow-hidden pt-1 text-xs">
//                             {documentName}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })
//               : "Select files to attach"}
//           </div>
//         </>
//         {/* ) : ( */}
//         <>
//           <div className="flex justify-center h-fit w-full lg:w-52 lg:px-0 ">
//             <div className="flex items-center justify-center w-full  h-fit">
//               <label
//                 htmlFor="dropzone-file"
//                 className="flex flex-col items-center justify-center w-full h-fit border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
//               >
//                 <div className="flex flex-col items-center justify-center pt-5 pb-6">
//                   <svg
//                     className="w-9 h-9 text-gray-500 dark:text-gray-400"
//                     aria-hidden="true"
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="50"
//                     height="50"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       stroke="currentColor"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M12 7.757v8.486M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
//                     />
//                   </svg>
//                 </div>
//                 <input
//                   id="dropzone-file"
//                   type="file"
//                   className="hidden"
//                   onChange={handleFileChange}
//                 />
//               </label>
//             </div>
//           </div>
//         </>
//         {/* )} */}
//         <div
//           className={`${
//             uploadFileName
//               ? "flex mt-1 justify-center lg:justify-start"
//               : "flex mt-1 justify-center lg:justify-start lg:mx-16"
//           }`}
//         >
//           <span id="file-chosen" className="font-normal text-sm text-gray-800">
//             {uploadFileName ? uploadFileName : "Upload Files"}
//           </span>
//         </div>
//         {validationError && (
//           <div className="flex justify-center mt-3">
//             <span className="text-red-500">{validationError}</span>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// };

// export default S3UploadComponent;
