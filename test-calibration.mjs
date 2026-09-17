import dns from 'dns';
import dotenv from 'file:///D:/backend/node_modules/dotenv/lib/main.js';
import { GoogleGenerativeAI } from 'file:///D:/backend/node_modules/@google/generative-ai/dist/index.mjs';

dotenv.config({ path: 'D:/backend/.env' });
try { dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']); } catch (e) {}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

console.log('Testing gemini-3.6-flash on vision...');
// Create a small 1x1 white pixel test PNG to check vision API
const testPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');

const prompt = `You are an AI Stylist. Does this image contain a real human face or portrait?
Return JSON:
{
  "isHumanFace": boolean,
  "faceDetected": boolean,
  "errorMessage": string or null
}`;

const result = await model.generateContent([
  prompt,
  {
    inlineData: {
      data: testPng.toString('base64'),
      mimeType: 'image/png'
    }
  }
]);

const res = await result.response;
console.log('Result for non-human test image:\n', res.text());
