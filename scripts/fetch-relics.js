const axios = require('axios');
const cheerio = require('cheerio');
const _ = require('lodash');
const fs = require('fs');
const join = require('path').join;

const DROPS_PAGE_URL = 'https://n8k6e2y6.ssl.hwcdn.net/repos/hnfvc0o3jnfvc873njb03enrf56.html';

const RELICS_DATA_FOLDER = join('../data', 'relics');
const JSON_FILE_EXT = '.json';

const fetchRelics = dropsPage => {
	const $ = cheerio.load(dropsPage);
	const relicsRewards = findRelicsByRewards($);
	const cetusRelics = findCetusBountiesRelics($);
	const solarisRelics = findSolarisBountiesRelics($);
	const missionRelics = findMissionRelics($);
	const availableRelics = collectAvailableRelics(missionRelics);
	const unavailableRelics = collectUnavailableRelics(Object.keys(relicsRewards), availableRelics);
	return {
		availableRelics,
		unavailableRelics,
		relicsRewards,
		cetusRelics,
		solarisRelics,
		missionRelics
	};
}

const findRelicsByRewards = $ => {
	const $relicsTableBody = $('#relicRewards').next().find('tbody');
	let relics = {};
	$relicsTableBody.find('tr:not(.blank-row)').each(function() {
		const $el = $(this);
		if($el.children("th").length) {
			relics[$el.text()] = [];
		} else if($el.children("td").length) {
			const relicNames = Object.keys(relics);
			const lastAddedRelic = relicNames[relicNames.length - 1];
			const name = $el.find('td:first-child').text();
			const rarity = $el.find('td:nth-child(2)').text();
			relics[lastAddedRelic].push({name, rarity});
		}
	});
	return normalizeRelicsData(relics);
}

const normalizeRelicsData = relics => {
	return _.flow(collectIntactRelics, 
		formatRelicNames)(relics);
}

const collectIntactRelics = relics => {
	const signOfIntactRelic = 'Intact';
	return _.pickBy(relics, function(value, key) {
		return key.includes(signOfIntactRelic);
	});
}

const formatRelicNames = relics => {
	return _.mapKeys(relics, function(value, key) {
		return key.split(' (')[0];
	});
}

const findCetusBountiesRelics = $ => {
	const $cetutBountiesRewardsTableBody = $('#cetusRewards').next().find('tbody');
	let cetusBountiesRelics = [];
	$cetutBountiesRewardsTableBody.find('tr:not(.blank-row)').each(function() {
		const $el = $(this);
		if($el.find('th:contains("Ghoul")').length) {
			return false;
		} else if($el.children("td").length) {
			const item = $el.find('td:nth-child(2)').text();
			if(item.includes('Relic') && !cetusBountiesRelics.includes(item)) {
				cetusBountiesRelics.push(item);
			}
		}
	});
	return cetusBountiesRelics;
}

const findSolarisBountiesRelics = $ => {
	const $solarisRewardsTableBody = $('#solarisRewards').next().find('tbody');
	let solarisBountieRelics = [];
	$solarisRewardsTableBody.find('tr:not(.blank-row)').each(function() {
		const $el = $(this);
		if($el.find('th:contains("PROFIT-TAKER")').length) {
			return false;
		} else if($el.children("td").length) {
			const item = $el.find('td:nth-child(2)').text();
			if(item.includes('Relic') && !solarisBountieRelics.includes(item)) {
				solarisBountieRelics.push(item);
			}
		}
	});
	return solarisBountieRelics;
}

const findMissionRelics = $ => {
	const $missionRewardsTableBody = $('#missionRewards').next().find('tbody');
	let missionRelics = {};
	let rotation = '';
	$missionRewardsTableBody.find('tr:not(.blank-row)').each(function() {
		const $el = $(this);
		if($el.children("th").length) {
			const thText = $el.text();
			if(/Rotation [ABC]+/.test(thText)) {
				rotation = thText
			} else {
				missionRelics[thText] = [];
			}
		} else if($el.children("td").length) {
			const name = $el.find('td:first-child').text();
			if(name.includes('Relic')) {
				const rarity = $el.find('td:nth-child(2)').text();
				const rarityPercent = rarity.match(/.+ \(([\d.]+)%\)/)[1];
				const missionNames = Object.keys(missionRelics);
				const lastAddedMission = missionNames[missionNames.length - 1];
				missionRelics[lastAddedMission].push({name, rotation, rarity: rarityPercent});
			}
		}});
	return missionRelics;
}


const collectAvailableRelics = missionRelics => {
	let availableRelics = [];
	_.each(missionRelics, (relics, missionName) => {
		_.each(relics, relic => {
			const explicitRelicName = relic.name.match(/([A-Za-z 0-9]+)( \(Radiant|Intact|Exceptional|Flawless\))?/)[1].trim();
			if(!availableRelics.includes(explicitRelicName)) {
				availableRelics.push(explicitRelicName);
			}
		});
	});
	return availableRelics;
}

const collectUnavailableRelics = (allRelics, availableRelics) => {
	return allRelics.filter(relic => !availableRelics.includes(relic));
}

const saveRelicsDataToFiles = relics => {
	_.each(relics, (fileContent, fileName) => {
		const filePath = join(RELICS_DATA_FOLDER, fileName + JSON_FILE_EXT);
		fs.writeFileSync(filePath, JSON.stringify(fileContent));
		console.log(`File was saved ${fileName + JSON_FILE_EXT}`);
	});
}

axios.get(DROPS_PAGE_URL)
	.then(page => {
		if(!page) {
			throw new Error('Cannot load drops page');
		}
		return fetchRelics(page.data);
	}).catch(e => console.log(e))
	.then(saveRelicsDataToFiles)
	.catch(e => console.log(e));