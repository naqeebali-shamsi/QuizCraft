const axios = require('axios');
const functions = require("@google-cloud/functions-framework");
const NLP_API_KEY = process.env.GOOGLE_NLP_API_KEY //replace with your NLP API Key in in your env vars
module.exports.main = async (req, res) => {
    try {
        const question  = req.body;
        const response = await axios.post(
            `https://language.googleapis.com/v1beta2/documents:classifyText?key=${NLP_API_KEY}`,
            {
                document: {
                    content: question + question + question,
                    type: 'PLAIN_TEXT',
                },
                classificationModelOptions: {
                }
            },
        );
        const category = response.data.categories[0].name;
        res.status(200).send(category);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error');
    }
};

