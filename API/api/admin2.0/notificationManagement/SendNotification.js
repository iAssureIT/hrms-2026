const globalVariable    = require("../../../nodemonConfig.js");
const axios             = require('axios');


function send_notification_function(formValues){    
    // console.log("send_notification_function formValues => ", formValues);
    return new Promise((resolve,reject)=>{
        axios.post('http://localhost:'+globalVariable.port+'/api/masternotifications/post/sendNotification', formValues)
        .then((res) => {
            // console.log("send_notification_function res => ",res.data)
            resolve(res.data);
        })
        .catch((error) => {
            console.log('send_notification_function error: ',error)
            resolve(error)
        })
    })
};
   
module.exports = { send_notification_function };


/**============ FormValues for SendNotification =============
    formValues = {    
        "event"			    : 'NewOrder',                               /------ Event Name from Event Template Name Mapping ------/
        "toUser_id"		    : req.body.user_id,                         /------ _id (form users collection) of user to whom you want to send notification / mail /sms ------/
        "toUserRole"	    : 'user',                                   /------ Role of user ------/
        "toMobileNumber"    : orderdata.deliveryAddress.mobileNumber    /------ Mobile Number to which you want to send SMS other than mobile number present in user details ------/
        "company_id"        : vendor_id,                                /------ _id (from entitymasters collection) of entity (vendor / ba / corporate) ------/
        "otherAdminRole"    : 'vendoradmin',                            /------ particular role from the above selected compony you want to send notification / mail /sms ------/
        "variables" 	    : {
                                "userName" 			: orderdata.userFullName,                       ============|
                                "userEmailAddress" 	: result.data.corporateName,                                |
                                "userMobileNum"		: result.data.vendorDetails.profile.mobile,                 |=> set of tokens you will be going to use in templates
                                "orderNumber" 		: orderdata.orderID,                                        |
                                "deliveryAddress" 	: orderdata.deliveryAddress                                 |
        }								                                                            ============|
    }
 */

