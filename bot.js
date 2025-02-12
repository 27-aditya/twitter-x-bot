import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';
import dayjs from 'dayjs';

dotenv.config();

const apiKey = process.env.API_KEY;
const xApiKey = process.env.X_API_KEY;
const xApiKeySecret = process.env.X_API_KEY_SECRET;
const xAccessToken = process.env.X_ACCESS_TOKEN;
const xAccessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET;

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

const headers = {
    "Content-Type": "application/json"
};

const data = {
    "contents": [{
        "parts": [{
            "text": "Give me a bold programming hot take in one or two sentences. Be concise and impactful."
        }]
    }]
};

async function generateTweet() {
    const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
    console.log(`\n[${timestamp}] Starting tweet generation...`);
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });
        
        const responseData = await response.json();
        const contentText = responseData.candidates[0].content.parts[0].text;
        
        console.log(`[${timestamp}] Generated content: ${contentText}`);

        const tweetText = `${contentText}\nAutomated by @Null273`;
        
        const twitterClient = new TwitterApi({
            appKey: xApiKey,
            appSecret: xApiKeySecret,
            accessToken: xAccessToken,
            accessSecret: xAccessTokenSecret
        });

        const rwClient = twitterClient.readWrite;

        const tweetResponse = await rwClient.v2.tweet(tweetText);
        
        console.log(`[${timestamp}] Successfully tweeted: ${tweetText}`);
        console.log(`[${timestamp}] Tweet response:`, tweetResponse);
    } catch (error) {
        console.error(`[${timestamp}] Error:`, error);
    }
}

function scheduleNextTweet() {
    const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    const nextTweetTime = dayjs().add(2, 'hour').format('YYYY-MM-DD HH:mm:ss');
    
    console.log(`\n[${dayjs().format('YYYY-MM-DD HH:mm:ss')}] Scheduling next tweet for: ${nextTweetTime}`);
    
    setTimeout(() => {
        generateTweet()
            .then(() => scheduleNextTweet())
            .catch(error => {
                console.error(`[${dayjs().format('YYYY-MM-DD HH:mm:ss')}] Scheduling error:`, error);
                scheduleNextTweet(); // Reschedule even if there's an error
            });
    }, twoHours);
}

// Initial tweet and start scheduling
console.log(`[${dayjs().format('YYYY-MM-DD HH:mm:ss')}] Starting tweet bot...`);
generateTweet()
    .then(() => scheduleNextTweet())
    .catch(error => {
        console.error(`[${dayjs().format('YYYY-MM-DD HH:mm:ss')}] Initial tweet error:`, error);
        scheduleNextTweet(); // Start scheduling even if initial tweet fails
    });