const axios = require('axios');
const config = require('../../../nodemonConfig')

exports.getLinkedinProfile = (profileType, linkedinProfileUrl) => {
    const apiEndpoint = profileType == 'consultant' ? 'https://nubela.co/proxycurl/api/v2/linkedin' : 'https://nubela.co/proxycurl/api/linkedin/company'
    const apiKey = config.LINKEDIN_API_KEY
    const headers = { 'Authorization': 'Bearer ' + apiKey }
    return axios.default
        .get(apiEndpoint, {
            params: { url: linkedinProfileUrl },
            headers: headers
        })
        .then(response => {
            return {
                success: true,
                data: response.data
            }
        })
        .catch(err => {
            console.log("getLinkedinProfile Error => ",err);
            return { success: false, error: "Profile not found. Please verify Linkedin profile URL." }
        })

}
