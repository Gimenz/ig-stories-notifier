require('dotenv').config()
const { getUserByUsername, getStories } = require('instagram-stories')

const checkStory = (u) => new Promise(async (resolve, reject) => {
    try {
        const { user } = await getUserByUsername({ username: u, sessionid: `${process.env.SESSION_ID}` })
        const data = await getStories({ id: user.id, sessionid: `${process.env.SESSION_ID}`, userid: process.env.IG_USER_ID })
        let { username, full_name, pk } = user
        media_count = data.media_count
        items = data.items
        if (items.length == 0) return reject({
            status: false,
            result: 'Stories Not Found / Private Account'
        });
        let storyList = new Array()
        for (let i = 0; i < items.length; i++) {
            if (items[i].media_type == 1) {
                storyList.push({
                    type: 'image',
                    mimetype: 'image/jpeg',
                    url: items[i].image_versions2.candidates[0].url,
                    taken_at: items[i].taken_at,
                    id: items[i].id,
                    swipeup_link: items[i].story_cta !== undefined ? items[i].story_cta.map(x => decodeURIComponent(x.links.map(v => v.webUri))) : null
                })
            } else {
                storyList.push({
                    type: 'video',
                    mimetype: 'video/mp4',
                    url: items[i].video_versions[0].url,
                    taken_at: items[i].taken_at,
                    id: items[i].id,
                    swipeup_link: items[i].story_cta !== undefined ? items[i].story_cta.map(x => decodeURIComponent(x.links.map(v => v.webUri))) : null
                })
            }
        }
        resolve({
            status: true,
            result: {
                username,
                userID: pk,
                media_ids: data.media_ids,
                full_name,
                media_count,
                data: storyList
            }
        })
    } catch (error) {
        reject({
            status: false,
            result: 'emboh rangerti'
        })
    }
})

module.exports = {
    checkStory
}