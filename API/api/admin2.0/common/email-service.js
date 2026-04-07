const { SendEmailCommand, SESClient } = require('@aws-sdk/client-ses')
const config =require('../../../nodemonConfig.js')
const AWS_SES_API_KEY = config.AWS_SES_API_KEY
const AWS_SES_API_SECRET_KEY = config.AWS_SES_API_SECRET_KEY
const AWS_SES_REGION = config.AWS_SES_REGION

async function sendEmail(toAddresses, fromAddress, subject, body) {
    const sendEmailCommand = new SendEmailCommand({
        Destination: {
            // BccAddresses,
            // CcAddresses,
            ToAddresses: toAddresses
        },
        Source: fromAddress,
        Message: {
            Body: { Html:{Data: body} }, Subject: { Data: subject }
        },
    })

    const sesClient = new SESClient({
        credentials: {
            accessKeyId: AWS_SES_API_KEY,
            secretAccessKey: AWS_SES_API_SECRET_KEY,
        }, region: AWS_SES_REGION
    })
    // console.log(`AWS SES Service: sending email to ${toAddresses} from ${fromAddress} with subject ${subject}`);

    try {
        const response = await sesClient.send(sendEmailCommand)
        console.log(`AWS SES Service:  Email sent to ${toAddresses} & messageId is ${response.$metadata} & response code is ${response.$metadata.httpStatusCode}`)
        // console.log(JSON.stringify(response.$metadata))
        return response
    } catch (error) {
        console.log("mailerror", error)
        console.error(`AWS SES Service:email sending failed with error=> ${error}`)
        return error
    }
}


module.exports = sendEmail;