const fs = require('fs');
const join = require('path').join;
const axios = require('axios');

const PLATFORMS = ['pc', 'ps4', 'xb1'];
const FRAME_FOLDER = join(__dirname, '../data/trader');
const getTraderInventoryUrlByPlatform = platform => `https://api.warframestat.us/${platform}/voidTrader`;


const buildUrls = () => {
	let urls = [];
	for(let i = 0; i < PLATFORMS.length; i++) {
		const apiUrl = getTraderInventoryUrlByPlatform(PLATFORMS[i]);
		urls.push(apiUrl);
	}
	return urls;
}

axios.all(buildUrls().map(url => axios.get(url)))
    .then(axios.spread((...responses) => {
        for (let i = 0; i < responses.length; i++) {
        	const pathToFile = join(FRAME_FOLDER, `${PLATFORMS[i]}.json`);
        	fs.writeFileSync(pathToFile, JSON.stringify(responses[i].data));
        	console.log(`Saved file ${pathToFile}`);
        }
    }))
    .catch(err => console.log(err));