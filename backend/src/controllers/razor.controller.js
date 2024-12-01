import crypto from "node:crypto";
import razorpay from "../utils/razorPay.js";

const createOrder = async (req, res) => {
  const { amount, currency, receipt } = req.body;

  try {
    const options = {
      amount: amount * 100, // Razorpay works in paise (INR * 100)
      currency: currency || "INR",
      receipt: receipt || "receipt#1",
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log("err is", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const verifyPay = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const key_secret = "a8kJQk4qrYxjOcXSDNwvm8BX"; // Replace with your Razorpay key_secret

  // Use `crypto.createHmac` to generate the signature
  const generatedSignature = crypto
    .createHmac("sha256", key_secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature === razorpay_signature) {
    res
      .status(200)
      .json({ success: true, message: "Payment verified successfully!" });
  } else {
    res
      .status(400)
      .json({ success: false, message: "Payment verification failed!" });
  }
};

export { createOrder, verifyPay };
