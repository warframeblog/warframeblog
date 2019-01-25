const fs = require('fs');
const join = require('path').join;
const axios = require('axios');
const matter = require('gray-matter');

const PLATFORMS = ['pc', 'ps4', 'xb1', 'swi'];
const FRAME_FOLDER = join(__dirname, '../data/trader');
const PATH_TO_TRADER_INVENTORY_POST = join(__dirname, '../content', 'baro-kiteer-void-trader.md');

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
    .catch(err => console.log(err))
    .then(() => {
        const content = fs.readFileSync(PATH_TO_TRADER_INVENTORY_POST, 'utf8');
        const contentFile = matter(content);
        contentFile.data.date = new Date();

        fs.writeFileSync(PATH_TO_TRADER_INVENTORY_POST, contentFile.stringify());
        console.log(`Updated publish date for ${PATH_TO_TRADER_INVENTORY_POST} file`);
    }).catch(err => console.log(err));