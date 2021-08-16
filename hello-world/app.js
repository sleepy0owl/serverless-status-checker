const axios = require('axios');
const AWS = require('aws-sdk');
// const url = 'http://checkip.amazonaws.com/';
let response;
const ses = new AWS.SES({ region: 'us-east-1'});
/**
 * Sends email to recipient using AWS SES
 * 
 * @param {string} recipient - Recipient of the email 
 * @param {string} subject   - Subject of the email
 * @param {string} body      - Body of the email
 * 
 */
function sendemail(recipient, subject, body) {
    // send email to recipient using ses 
    let params = {
        Destination: {
          ToAddresses: [recipient],
        },
        Message: {
          Body: {
            Text: { Data: body },
          },
    
          Subject: { Data: subject },
        },
        Source: "sourav.mondal@antstack.io",
      };
      return ses.sendEmail(params).promise()
}

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.lambdaHandler = async (event, context) => {
    const check_url = 'https://9ivis52ej6.execute-api.us-east-1.amazonaws.com/status';
    const subject = "[Action Required] Service down";
    const body = "Your service is down, please take necessary action";
    try {
        const ret = await axios.get(check_url);
        console.log('current status ', ret.status);
        if (ret.status === 200) {
            console.log('service is wokring and live, dont need to send email');
        }else{
            console.log(`status code is ${ret.status}, ignoring....`);
        }
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: 'response from service checker',
                // location: ret.data.trim()
            })
        }
    } catch (err) {
        console.log(err.response.data);
        let emailresponse = await sendemail(process.env.RECIPIENT, subject, body);
        console.log(emailresponse);
        return response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: 'error occured',
            })
        };
    }
    return response
};
