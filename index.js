const TelegramApi = require("node-telegram-bot-api")
const {gameOptions, againOptions} = require("./options")
const sequelize = require("./db")
const UserModel = require("./models")

const token = "5382016870:AAFeRtLHkNQBYr5eb3qVCEDUA0WDoWpmH2Y"

const bot = new TelegramApi(token, {polling:true})

const chats = {}

const startNewGame = async (chatId) => {
    await bot.sendMessage(chatId, "Random nubmer from 0 to 9. Your choise ?")
    const randomNumber = Math.floor(Math.random()*10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, "Your choise", gameOptions)
}

const start = async () => {

    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (e) {
        console.log("Connecting to DB is wrong", e);
    }

    bot.setMyCommands([
        {command: "/start", description: "First start"},
        {command: "/info", description: "Get info"},
        {command: "/game", description: "Lets play"},
    ])
    
    bot.on("message", async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;

        try {
            if(text === "/start") {
                await UserModel.create({chatId})
                await bot.sendSticker(chatId, "https://cdn.tlgrm.app/stickers/7e8/aa6/7e8aa67b-ad91-4d61-8f62-301bde115989/256/5.webp")
                return bot.sendMessage(chatId, `Hi to all. Get start it`)
            }
        
            if(text === "/info") {
                const user = await UserModel.findOne({chatId})
                return bot.sendMessage(chatId, `Your name is ${msg.from.first_name} ${msg.from.last_name}, right answer: ${user.right}, wrong answer: ${user.wrong}`)
            }
            if(text === "/game") {
                return startNewGame(chatId);
            }
            
            return bot.sendMessage(chatId, "What are you waiting for?")
        } catch (e) {
            return bot.sendMessage(chatId, "There is error")
        }

        // bot.sendMessage(chatId, `Hi to all ${text}`)
        // console.log(msg);
    })

    bot.on("callback_query", async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if(data === "/again") {
            return startNewGame(chatId);
        }

        const user = await UserModel.findOne({chatId})


        //была ошибка в строгом равенстве потому, что типы данных разные
        if(data == chats[chatId]) {
            user.right += 1;
            await bot.sendMessage(chatId, `Congratulations! It's right! ${chats[chatId]}`, againOptions)
        } else {
            user.wrong += 1;
            await bot.sendMessage(chatId, `LOL. NOOOO! ${chats[chatId]}`, againOptions)
        }

        await user.save();

        // bot.sendMessage(chatId, `You chouse ${data}`)
        // console.log(msg);
    })
}

start ();