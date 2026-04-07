import React from 'react'
import Image from 'next/image'

const ComingSoon = (props) => {
  return (
    <section>
      <Image className="mx-auto my-5" width={600} height={300} src={props.image} alt="Coming Soon"/>
    </section>
  )
}

export default ComingSoon