const { Configuration, OpenAIApi } = require("openai");
const axios = require('axios');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const _ = require('lodash');
require('dotenv').config();


router.get('/ask', auth, async (req, res) => {
    const token = req.headers['x-auth-token'];
    // console.log(token);
    const categoryData = await axios.get(`${process.env.BASE_URL}/api/category/`, { headers: { 'x-auth-token': token } });

    const inputArray = [];
    categoryData.data.forEach(category => {
        if (category.name == 'credit' || category.name == 'Credit') {
        } else {
            inputArray.push(_.pick(category, ['name', 'totalAmountInside']));
        }
    });

    const input = `my finance data divided in categories is like this - ${JSON.stringify(inputArray)} . give me financial advice based on this.`;
    // console.log(input);

    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `${input}`,
        temperature: 0.9,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });

    return res.send(response.data.choices[0].text);
});

router.post('/message', auth, async (req, res) => {
    const input = req.body.message;

    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `${input}`,
        temperature: 0.9,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });

    return res.send(response.data.choices[0].text);
});

module.exports = router;