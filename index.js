const fs = require('fs');
const db = require('./db');
const cron = require('node-cron');
const { checkStory } = require('./lib/fetcher');
const color = require('./utils/color');
var moment = require('moment-timezone');
moment.tz.setDefault('Asia/Jakarta'); // Change this to your local timezone
moment.locale('id'); // Change this to your locale
const { Telegraf } = require('telegraf');
require('dotenv').config();
const bot = new Telegraf(process.env.BOT_TOKEN);

let list = ''; // HERE IS YOUR TARGET USERNAME e.g 'aswbgtya,adidas,adiraas.p' separated by comma // don't put username too much, your account may be locked
let parsedTarget =  list.split(",");


async function getStory(username) {
    try {
        let meta = await checkStory(username);
        let media_ids = meta.result.media_ids.map(x => x);
        //media_ids = data.id
        let isSaved = await db.findStoryID(media_ids);
        let dta = meta.result.data.filter(x => x.id.match(media_ids));

        if (!isSaved) {
            await db.addStoryID(media_ids);
            console.log(color('[NEW STORY FOUND]', 'green'), color('FROM => @' + meta.result.username, 'cyan'), color(moment(dta.map(x => x.taken_at * 1000)).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'IDS ==>', color(media_ids, 'yellow'));
            meta.result.data.map(async story => {
                if (story.type == 'image') {
                    bot.telegram.sendPhoto(`${process.env.TELEGRAM_ID}`, story.url, {
                        caption: `<b>NEW STORY</b> - <i>Story from <a href="https://www.instagram.com/${meta.result.username}">@${meta.result.username}</a></i>\nTaken at : ${moment(story.taken_at * 1000).format('dddd, MMMM Do YYYY, hh:mm')}`,
                        parse_mode: 'HTML'
                    });
                } else if (story.type == 'video') {
                    bot.telegram.sendVideo(`${process.env.TELEGRAM_ID}`, story.url, {
                        caption: `<b>NEW STORY</b> - <i>Story from <a href="https://www.instagram.com/${meta.result.username}">@${meta.result.username}</a></i>\nTaken at : ${moment(story.taken_at * 1000).format('dddd, MMMM Do YYYY, hh:mm')}`,
                        parse_mode: 'HTML'
                    });
                }
            });
        } else {
            console.log('waiting for new story updates ' + color(moment().format('DD/MM/YY HH:mm:ss'), 'yellow'));
        }
    } catch (e) {
        console.log('[ERROR]', e);
    }
}

// P.S don't call the function too fast, pause at least 4 times a day or less. if too fast your account will got locked
cron.schedule('*/5 5-23/2 * * *', async () => {
    //console.log('running a task every two hours between 5 a.m. and 23 p.m.');
    await Promise.all(parsedTarget.map((target) => getStory(target)));
});


// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

bot.launch();
console.log('BOT STARTED');

