const axios = require('axios');
const cheerio = require('cheerio');
const warframes = require('../data/warframes');
const fs = require('fs');
const join = require('path').join;

const URL = 'https://www.warframe.com/game/warframes/';
const FRAME_FOLDER = join(__dirname, '../static/images/abilities');

const getFrameDataRequest = url => {
	return axios.get(url);
}

const downloadImage = (url, path) => {
	return axios.get(url, {
			responseType: 'stream'
		})
		.then(response => {
			response.data.pipe(fs.createWriteStream(path))

			return new Promise((resolve, reject) => {
				response.data.on('end', () => resolve());
				response.data.on('error', () => reject());
			});
		});
}


const buildUrls = () => {
	let urls = [];
	for(let i = 0; i < warframes.length; i++) {
		urls.push(URL + warframes[i]);
	}
	return urls;
}

const getData = response => {
	let $ = cheerio.load(response.data);
	const title = $('.one-half > h2').text();
	let data = {
		title,
		abilities: []
	};
	$('#powers').find('li').each( function(i, element) {
		const abilityName = $(this).find('.powerTitle').text();
		const abilityImg = $(this).find('.ability-splash').attr('src');
		data.abilities.push({name: abilityName, img: 'http:' + abilityImg});
	});
	return data;
}

const saveAbilityImagesToDisk = async (path, abilities) => {
	for(let i = 0; i < abilities.length; i++) {
		const ability = abilities[i];
		const abilityImageName = ability.name.replace(/\s+/g, '-').toLowerCase() + '.png';
		try {
			await downloadImage(ability.img, join(path, abilityImageName));
		} catch(e) {
			console.error(e);
		}
	}
}

axios.all(buildUrls().map(getFrameDataRequest))
    .then(axios.spread((...results) => {
    	let framesData = [];
        for (let i = 0; i < results.length; i++) {
        	framesData.push(getData(results[i]));
        }

        return framesData;
    }))
    .then(data => {
    	for(let i = 0; i < data.length; i++) {
    		const frameData = data[i];
    		const path = join(FRAME_FOLDER, frameData.title.toLowerCase());
			if (!fs.existsSync(path)){
				fs.mkdirSync(path);
			}
    		saveAbilityImagesToDisk(path, frameData.abilities);
	    	console.log(`Ability images for ${frameData.title} were saved`);
    	}
    }).catch(e => console.error(e));
