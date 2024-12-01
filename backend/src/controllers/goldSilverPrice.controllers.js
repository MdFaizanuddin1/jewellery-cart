import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

import { Price } from "../models/goldSilverPrice.model.js";

// const fetchGoldSilverPrices = async () => {
//   try {
//     const response = await axios.get('API_URL', {
//       params: {
//         access_key: 'YOUR_API_KEY',
//         base: 'USD', // Or the currency you want
//         symbols: 'XAU,XAG', // XAU for gold, XAG for silver
//       },
//     });

//     const prices = response.data;
//     console.log('Gold Price:', prices);
//     console.log('Gold Price:', prices.rates.XAU);
//     console.log('Silver Price:', prices.rates.XAG);
//     return prices.rates;
//   } catch (error) {
//     console.error('Error fetching prices:', error.message);
//     throw error;
//   }
// };

// const savePricesToDB = async (prices) => {
//   try {
//     const price = new Price({ gold: prices.XAU , silver: prices.XAG });

//     await price.save();
//     console.log("Prices saved to DB successfully!");
//   } catch (error) {
//     console.error("Error saving to DB:", error.message);
//   }
// };

// npm install node-cron
// import corn

// cron.schedule('0 0 * * *', async () => {
//     console.log('Fetching and updating daily prices...');
//     const prices = await fetchGoldSilverPrices();
//     await savePricesToDB(prices);
//   });

// const getPrice = async (req, res) => {
//   try {
//     const prices = await Price.find().sort({ date: -1 }).limit(2); // Latest 2 prices
//     res.status(200).json({ success: true, data: prices });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };
// export {getPrice}

const getPrice = asyncHandler(async (req, res) => {
  if (req.user.role != "admin") {
    throw new ApiError(404, "You are not authorized");
  }
  const price = await Price.find({});

  if (!price) {
    throw new ApiError(500, "Price Not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, price, "price fetched successfully"));
});

export { getPrice };
