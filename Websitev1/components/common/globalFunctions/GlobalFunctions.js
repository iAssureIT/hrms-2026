import React from "react";
import ls from 'localstorage-slim';
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

export function getURLParams(){
  const router = useRouter();
  const userDetails = ls.get('userDetails', {decrypt: true});
  const searchParams = useSearchParams();
  const r   = searchParams.get('r');
  let role  = 'default';

  switch(r){
    case 'a' : 
      if(userDetails.roles.includes("admin")){
        role = 'admin';
      }else{
        router.push('/user/404');
      }
      break;

    case 'c' : 
      if(userDetails.roles.includes("center-incharge")){
        role = 'center-incharge';
      }else{
        router.push('/user/404');
      }
      break;

    default  :
      if(userDetails.roles.includes("head-csr")           || 
         userDetails.roles.includes("head-livelihood")    ||
         userDetails.roles.includes("senior-manager")     ||
         userDetails.roles.includes("executive-management")
        ){
        role = 'executive-management'; 
      }else{
        router.push('/user/404');
      }
      break;
  }

  delete userDetails["roles"];
  delete userDetails["token"];

  userDetails.role = role;

  return userDetails;
}