import { Tooltip } from "flowbite-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const page = () => {
  var currentYear = new Date().getFullYear();
  return (
    <section className="section">
      <div className="box border-2 rounded-md shadow-md">
        <div className="uppercase text-xl font-semibold">
          <div className="border-b-2 border-gray-300 flex justify-between">
            <h1 className="heading">User Manual</h1>
          </div>
        </div>
        <div className="w-full mx-auto py-20">
          <div className="my-5 flex justify-center mx-10 gap-20">
            {/* <div className="border-2 border-dashed border-gray-500 px-20 py-5 rounded-2xl">
              <Image
                src="/images/generic/ppt-icon.png"
                alt="User Manual"
                width={400}
                height={400}
                className="h-[100px] max-h-[100px] w-[100px] max-w-[100px] mx-auto mb-4"
              />
              <div>
                <a
                  href="/files/User_Manual_Lupin_2.pptx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 underline underline-offset-4 hover:text-blue-800"
                >
                  View Presentation Online
                </a>
              </div>

              <div className="mt-4 text-center">
                <Link
                  href="https://test-lupin.s3.amazonaws.com/User Manual_Lupin_2.pptx"
                  download
                >
                  <span className="text-green-600 underline underline-offset-4 hover:text-blue-800">
                    Download Presentation
                  </span>
                </Link>
              </div>
            </div> */}
            <div className="border-2 border-dashed border-gray-500 px-20 py-5 rounded-2xl">
              <Image
                src="/images/generic/pdf-file-icon.png"
                alt="User Manual"
                width={400}
                height={400}
                className="h-[100px] max-h-[100px] w-[100px] max-w-[100px] mx-auto mb-4"
              />
              <div>
                <a
                  href="/files/User Manual_Lupin.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 underline underline-offset-4 hover:text-blue-800"
                >
                  Click to View
                </a>
              </div>

              {/* <div className="mt-4 text-center">
                <Link
                  href="https://test-lupin.s3.amazonaws.com/User Manual_Lupin (1).pdf"
                  target="_blank"
                  download
                >
                  <span className="text-green-600 underline underline-offset-4 hover:text-blue-800">
                    Download PDF
                  </span>
                </Link>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default page;
