import React from "react";

const Footer = (props) => {
  return (
    <section>
      <footer className="bg-white dark:bg-gray-900 ">
        <div className="mx-auto w-full max-w-screen-exLG  ">
          <div className="md:flex md:justify-between px-5 xl:px-20  bg-lightBlue py-20">
            <div className="grid xxl:grid-cols-4 gap-8 sm:gap-6 sm:grid-cols-4">
              <div className="mb-6 md:mb-0 items-center">
                <div>
                  <a href="/" className="flex items-center">
                    <img
                      src={props.logo}
                      className="h-22 mx-auto xl:w-72 xxl:w-72  "
                      alt="FlowBite Logo"
                    />
                  </a>
                </div>

                <div className="flex mt-4 py-4 space-x-6 sm:justify-center sm:mt-0">
                  <a
                    href={props.fbLink}
                    className="text-light hover:text-gray-900 dark:hover:text-white"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="sr-only">Facebook page</span>
                  </a>
                  <a
                    href="https://www.instagram.com/"
                    className="text-light hover:text-gray-900 dark:hover:text-white"
                  >
                    <i className="fa-brands fa-instagram"></i>{" "}
                  </a>
                  <a
                    href={props.linkedIn}
                    className="text-light hover:text-gray-900 dark:hover:text-white"
                  >
                    <i className="fa-brands fa-linkedin"></i>
                  </a>
                  <a
                    href="https://twitter.com"
                    className="text-light hover:text-gray-900 dark:hover:text-white"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                    <span className="sr-only">Twitter page</span>
                  </a>
                  <a
                    href="https://www.youtube.com/"
                    className="text-light hover:text-gray-900 dark:hover:text-white"
                  >
                    <i className="fa-brands fa-youtube"></i>
                  </a>
                </div>
              </div>
              <div>
                <h2 className="mb-6 text-sm xxl:text-xl font-semibold text-RMByellow uppercase dark:text-white">
                  {props.title1}
                </h2>
                <div className=" flex flex-wrap text-light dark:text-light-400 font-normal text-sm xxl:text-xl ">
                  {props.CategoriesArray?.length > 0
                    ? props?.CategoriesArray?.map((data, index) => {
                        return (
                          <div
                            key={index}
                            className="mb-4 container flex w-1/2"
                          >
                            <span className="flex">
                              <img
                                className="h-4 p-1 w-4"
                                src="/images/generic/right-arrow.png"
                                alt="right-arrow.png"
                              />
                            </span>
                            <a href="/" className="hover:underline flex">
                              {data}
                            </a>
                          </div>
                        );
                      })
                    : null}
                </div>
              </div>
              <div>
                <h2 className="mb-6 text-sm xxl:text-xl font-semibold text-RMByellow uppercase dark:text-white">
                  {props.title2}
                </h2>
                <div className="flex flex-wrap text-light dark:text-light-400 font-normal text-sm xxl:text-xl">
                  {props.sitemapList.length > 0
                    ? props?.sitemapList.map((data, index) => {
                        return (
                          <div key={index} className="mb-4 w-1/2">
                            <a href={data.link} className="hover:underline">
                              {data.name}
                            </a>
                          </div>
                        );
                      })
                    : null}
                </div>
              </div>
              <div>
                <h2 className="mb-6 text-sm xxl:text-xl font-semibold  text-RMByellow uppercase dark:text-white">
                  {props.title3}
                </h2>
                <ul className="text-light  font-normal text-sm xxl:text-xl overflow-hidden">
                  {props.addLine1 ? (
                    <li className="mb-4 flex flex-wrap">
                      <span className="ml-4">
                        <span>
                          <i className="fa-solid fa-location-dot mr-1 mt-1 text-RMByellow"></i>
                          &nbsp; <b>Address</b> <br />
                          {props.addLine1},<br />
                          {props.addLine2},<br />
                          {props.addLine3}
                        </span>
                      </span>
                    </li>
                  ) : null}
                  <hr className="bg-gray-50 mb-3 w-10/12" />
                  {props.phone ? (
                    <li className="mb-3">
                      <span>
                        <i className="fa-solid fa-mobile-screen mr-1 text-RMByellow"></i>
                        Phone : {props.phone}
                      </span>
                    </li>
                  ) : null}
                  <li className="flex">
                    <div className="flex ">
                      <i className="fa-regular fa-envelope m-1 text-RMByellow flex"></i>
                      Email:
                    </div>

                    <div className="flex px-1">
                      {props.email1} <br />
                      {props.email2}
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="sm:flex sm:items-center sm:justify-between bg-darkBlue py-5 xl:px-20 px-8">
            <span className="text-sm xxl:text-xl italic text-white sm:text-center dark:text-white">
              Copyright © 2023 RMB Pune Business Circle | All Rights Reserved
            </span>

            <span className="text-sm text-white xxl:text-sm sm:text-center ">
              Designed & Developed By &nbsp;
              <a
                href="https://iassureit.com/"
                target="_blank"
                className="text-white font-bold"
              >
                iAssure International Technologies Pvt. Ltd.
              </a>
            </span>
          </div>
        </div>
      </footer>
    </section>
  );
};

export default Footer;
