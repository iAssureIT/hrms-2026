import React from 'react'

const TopHeader = () => {
  return (
    <section>
        <nav className='h-12 flex justify-between xl:px-9'>
            <div className='text-lg font-bold py-2 px-5  text-white  lg:ml-16 my-auto'>
              RMB Pune Business Circle
            </div>
            <ul className='px-1 mr-10 py-3 md:flex  lg:flex xl:flex  space-x-5 justify-end text-sm font-semibold hidden'>
                {/*<li className='text-white text-xs font-normal '>
                  <i className="fa-solid fa-mobile-screen mr-1 font-normal "></i>
                  +91-9831020826
                </li>*/}
                <li className='text-white text-xs font-normal '>
                  <i className="fa-regular fa-envelope mr-1"></i>
                  <a href='https://mail.google.com/' target="_blank">rmbpunebusinesscircle@gmail.com</a>
                </li>
            </ul>
        </nav>
    </section>
  )
}
export default TopHeader
