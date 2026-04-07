const config = require('../../../nodemonConfig')

function smsService(toNumber, DLT_TE_ID, smsBody) {
    // console.log("toNumber, DLT_TE_ID================================",toNumber, DLT_TE_ID)
    // console.log("smsBody",smsBody)
    // console.log("config.MSG91_API_KEY, config.MS91_SENDER_ID, config.MSG91_ROUTE",config.MSG91_API_KEY, config.MS91_SENDER_ID, config.MSG91_ROUTE)
    const msg91 = Msg91Service(config.MSG91_API_KEY, config.MS91_SENDER_ID, config.MSG91_ROUTE)
    // console.log(`SMS Service: sending sms to ${toNumber}.`)

    msg91.send(toNumber, DLT_TE_ID, smsBody, function (error, response) {
        // console.log(`SMS Service: response sending sms==>`, response)
        if (error) {
        // console.log(`SMS Service: error sending sms==> ${error}`, error)
            // console.log(`SMS Service: error sending sms=> ${error}`)
            return
        }
        // console.log(`SMS Service: sending sms to ${toNumber}. Response is ${response}`)

    });
}

module.exports = smsService

const Msg91Service = function (authKey, senderId, route) {

    if (authKey == null || authKey == "") {
        throw new Error("MSG91 Authorization Key not provided.");
    }

    if (senderId == null || senderId == "") {
        throw new Error("MSG91 Sender Id is not provided.");
    }

    if (route == null || route == "") {
        throw new Error("MSG91 router Id is not provided.");
    }

    this.send = function (mobileNos, DLT_TE_ID, message, callback) {

        callback = modifyCallbackIfNull(callback);

        mobileNos = validateMobileNos(mobileNos);

        message = validateMessage(message);

        let isUnicode = isUnicodeString(message);

        let postData = "authkey=" + authKey + "&sender=" + senderId + "&mobiles=" + mobileNos + "&message=" + message + "&route=" + route + '&DLT_TE_ID=' + DLT_TE_ID;

        if (isUnicode) {
            postData = "&unicode=1";
        }

        let options = {
            hostname: 'control.msg91.com',
            port: 80,
            path: '/api/sendhttp.php',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postData.length
            }
        };

        makeHttpRequest(options, postData, function (err, data) {
            callback(err, data);
            // console.log("err------------------",err)
            // console.log("data------------------",data)
        });
    };

    return this;

};

function validateMobileNos(mobileNos) {

    if (mobileNos == null || mobileNos == "") {
        throw new Error("MSG91 : Mobile No is not provided.");
    }

    if (mobileNos instanceof Array) {
        mobileNos = mobileNos.join(",");
    }

    return mobileNos
}

function validateMessage(message) {

    if (message == null || message == "") {
        throw new Error("MSG91 : message is not provided.");
    }

    return message;
}

function modifyCallbackIfNull(callback) {
    return callback || function () { };
}

function isUnicodeString(str) {
    for (let i = 0, n = str.length; i < n; i++) {
        if (str.charCodeAt(i) > 255) { return true; }
    }
    return false;
}

function makeHttpRequest(options, postData, callback) {

    let http = require("http");
    let data = "";
    let req = http.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            callback(null, data);
        })
    });

    req.on('error', function (e) {
        callback(e);
    });

    if (postData != null) {
        req.write(postData);
    }

    req.end();

}

