import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;

if (!accountSid || !authToken || !serviceSid) {
  throw new Error("Twilio credentials are missing.");
}

const client = twilio(accountSid, authToken);

const sendOtp = async (phone) => {
  try {
    if (!phone) {
      throw new Error("Phone number is required.");
    }

    const verification = await client.verify.v2
      .services(serviceSid)
      .verifications.create({
        to: phone,
        channel: "sms", // or 'call'
      });

    return verification;
  } catch (error) {
    console.error("Error sending OTP:", error.message || error);
    throw {
      statusCode: error.statusCode || 500,
      message: "Failed to send OTP. Please try again.",
    };
  }
};
const verifyOtp = async (phone, otp) => {
  try {
    if (!phone || !otp) {
      throw new Error("Phone number and OTP are required.");
    }

    const verificationCheck = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({
        to: phone,
        code: otp,
      });

    return verificationCheck;
  } catch (error) {
    console.error("Error verifying OTP:", error.message || error);
    throw {
      statusCode: error.statusCode || 500,
      message: "Failed to send OTP. Please try again.",
    };
  }
};

export { sendOtp, verifyOtp };
