const axios = require('axios');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

async function initializeTransaction({ amount, email, reference }) {
    // Paystack expects amount in kobo (for NGN) or lower unit for other currencies
    const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
            amount,      // e.g. 50000 means 500.00 if NGN
            email,       // customer email
            reference,   // unique reference
            currency: 'NGN', // or appropriate currency
        },
        {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        }
    );

    return response.data;
}

module.exports = {
    initializeTransaction,
};