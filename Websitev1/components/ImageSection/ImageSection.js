import React from 'react'

const ImageSection = (props) => {
  return (
    <section className="">
      <img className={props.className? props.className : "h-96 w-auto mx-auto mt-10 xxl:my-16 pb-10"} src={props.image} alt={props.alt}/>
    </section>
  )
}

export default ImageSection
