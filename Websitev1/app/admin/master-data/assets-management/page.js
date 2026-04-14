'use client'
import React, { useState } from 'react';
import TwoFieldComponent from '@/widgets/masterData/twoFieldComponent/TwoFieldComponent.jsx';


const createInputObj = (label) => {
    const lowercaseLabel = label.toLowerCase();
    return {
        fieldlabel : label,
        insertAPI  : '/api/' + lowercaseLabel + '/post',
        getListAPI : '/api/' + lowercaseLabel + '/get',
        editAPI    : '/api/' + lowercaseLabel + '/put',
        deleteAPI  : '/api/' + lowercaseLabel + '/delete',
        showImg    : false,
    };
};

const Page = () => {
    
    const oneFieldInputObj    = createInputObj('Assets');
    const fieldlabel          = "Subassets";
    const lowercaseFieldlabel = fieldlabel.toLowerCase();
    const twoFieldInputObj    = {
        fieldlabel      : fieldlabel,
        insertAPI       : '/api/'+lowercaseFieldlabel+'/post',
        editAPI         : '/api/'+lowercaseFieldlabel+'/put',
        deleteAPI       : '/api/'+lowercaseFieldlabel+'/delete',
        getListAPI      : '/api/'+lowercaseFieldlabel+'/get',
        editDdListAPI   : '/api/'+lowercaseFieldlabel+'/patch',
        showImg         : false,
    };

    return (
        <div>
            <TwoFieldComponent 
                oneField={oneFieldInputObj} 
                oneFieldLable="Assets"
                twoFieldLable="Subassets"
                twoField={twoFieldInputObj}
            />
        </div>
    );
};

export default Page;