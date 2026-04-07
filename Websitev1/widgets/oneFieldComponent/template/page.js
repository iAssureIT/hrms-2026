'use client';

import { useState, useEffect } from 'react';
import OneFieldComponent from '@/components/oneFieldComponent/OneFieldComponent';

const Page = () => {
    const [openModal,setOpenModal] = useState(true);

    return (
        <div>
            <OneFieldComponent 
                fieldLabel='Department' 
                // editURL='/admin/master-data/department/'  //edit url by _id is remaining
                openModal={openModal} 
                setOpenModal={setOpenModal}
            />
        </div>
    );
};

export default Page;
