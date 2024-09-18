// const TelegramBot = require("node-telegram-bot-api");
// const cron = require("node-cron");
import TelegramBot from "node-telegram-bot-api";
import cron from "node-cron";
import { getDetails } from "./getDetails.js";
import dotenv from 'dotenv';
dotenv.config();

// Replace this with your actual bot token from BotFather
const token = process.env.TOKEN;

// Create a new bot instance
const bot = new TelegramBot(token, { polling: true });

// Function to schedule a message
async function scheduleMessage(chatId, messageFunc, scheduleTime) {
    const message = await messageFunc()
  cron.schedule(scheduleTime, () => {
    bot.sendMessage(chatId, message);
  });
}

const takeBotMsg = async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.toLowerCase();

  if (text === "start updates") {
    bot.sendMessage(chatId,"Hello! Sure, I will start sending updates at 9:00 AM.");
    const ipo = await getDetails("IPO");
    bot.sendMessage(chatId, ipo);
    const buyback = await getDetails("Buyback");
    bot.sendMessage(chatId, buyback);
    const rightIssue = await getDetails("Right Issue");
    bot.sendMessage(chatId, rightIssue);


    const dailyscheduleTime = "0 9 * * *";
    const weeklyScheduleTime = "0 9 * * 2,4";
    scheduleMessage(chatId, ()=>{getDetails("Buyback")}, dailyscheduleTime);
    scheduleMessage(chatId, ()=>{getDetails("IPO")}, dailyscheduleTime);
    scheduleMessage(chatId, ()=>{getDetails("Right Issue")}, weeklyScheduleTime);
  } else if(text === "ipo update"){
    const ipo = await getDetails("IPO");
    bot.sendMessage(chatId, ipo);
  }else if(text === "buyback update"){
    const buyback = await getDetails("Buyback");
    bot.sendMessage(chatId, buyback);
  }else if(text === "right issue update"){
    const rightIssue = await getDetails("Right Issue");
    bot.sendMessage(chatId, rightIssue);
  }else {
    bot.sendMessage(chatId, "Hello! This is my fixed response to everything!!");
  }
};

// Listen for messages
bot.on("message", takeBotMsg);

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Welcome! to the bot.');
});
