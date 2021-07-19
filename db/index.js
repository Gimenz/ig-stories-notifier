const low = require('lowdb')
const path = require('path')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('./db/db_story.json')
const db_story = low(adapter)

db_story.defaults({ storyList: [] }).write()

function isArrayInArray(arr, item){
    var item_as_string = JSON.stringify(item);

    var contains = arr.some(function(ele){
        return JSON.stringify(ele) === item_as_string;
    });
    return contains;
}


const findStoryID = (storyID) => new Promise((resolve, reject) => {
    const findRecords = db_story
        .get('storyList')
        .some({ id: storyID })
        .value();
    if (!findRecords) {
        resolve(findRecords);
    } else {
        resolve(findRecords);
    }
})

const addStoryID = (storyID) => new Promise((resolve, reject) => {
    const insertRecords = db_story
        .get('storyList')
        .push({ id: storyID })
        .write()
    if (!insertRecords) {
        reject('[DB] Error!', insertRecords);
    } else {
        resolve(insertRecords);
    }
})

const getAllStory = () => new Promise((resolve, reject) => {
    const allRecords = db_story
        .get('storyList')
        .toArray()
        .value()
    if (!allRecords) {
        reject('[DB] Error!', allRecords);
    } else {
        resolve(allRecords);
    }
})

const clearAllStory = () => new Promise((resolve, reject) => {
    const allRecords = db_story
        .set('storyList', [])
        .write()
    if (!allRecords) {
        reject('[DB] Error!', allRecords);
    } else {
        resolve(allRecords);
    }
})

module.exports = {
    findStoryID,
    addStoryID,
    getAllStory,
    clearAllStory,
}