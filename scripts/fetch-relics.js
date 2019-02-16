//relics by rewards
//void relics
//orb vallis relics
//cetus relics(skip ghoul relics)
//sanctuary relics
const axios = require('axios');
const cheerio = require('cheerio');
const _ = require('lodash');

const DROPS_PAGE_URL = 'https://n8k6e2y6.ssl.hwcdn.net/repos/hnfvc0o3jnfvc873njb03enrf56.html';
const VOID_MISSION_FEATURE = 'Void';
const SANCTUARY_FEATURE = 'Sanctuary';


axios.get(DROPS_PAGE_URL)
	.then(page => {

		const pageData = page.data;
		return fetchRelics(pageData);
	}).catch(e => console.log(e))
	.then(relics => {
		// console.log(relics.voidRelics)
		console.log(relics.sanctuaryRelics)
	})

const fetchRelics = dropsPage => {
	const $ = cheerio.load(dropsPage);
	const missionRelics = findMissionRelics($);
	const voidRelics = collectSpecificMissions(missionRelics, VOID_MISSION_FEATURE);
	const sanctuaryRelics = collectSpecificMissions(missionRelics, SANCTUARY_FEATURE);
	return {
		availableRelics: findAvailableRelics($),
		cetusRelics: findCetusBountiesRelics($),
		solarisRelics: findSolarisBountiesRelics($),
		voidRelics,
		sanctuaryRelics
	};
}

const findAvailableRelics = $ => {
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
	$missionRewardsTableBody.find('tr:not(.blank-row)').each(function() {
		const $el = $(this);
		if($el.children("th").length) {
			missionRelics[$el.text()] = [];
		} else if($el.children("td").length) {
			const name = $el.find('td:first-child').text();
			if(name.includes('Relic')) {
				const missionNames = Object.keys(missionRelics);
				const lastAddedMission = missionNames[missionNames.length - 1];
				missionRelics[lastAddedMission].push(name);
			}
		}});
	return missionRelics;
}

const collectSpecificMissions = (missionByRelics, missionFeature) => {
	return _.pickBy(missionByRelics, (relics, missionName) => missionName.includes(missionFeature));
}