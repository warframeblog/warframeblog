const _ = require('lodash');
const rewardsByRelics = require('../../data/relics/rewardsByRelics');
const availableRelics = require('../../data/relics/availableRelics');
const unavailableRelics = require('../../data/relics/unavailableRelics');
const cetusRelics = require('../../data/relics/cetusRelics');
const solarisRelics = require('../../data/relics/solarisRelics');
const relicsByMissions = require('../../data/relics/relicsByMissions');

const LITH_ERA_RELIC = 'Lith';
const MESO_ERA_RELIC = 'Meso';
const NEO_ERA_RELIC = 'Neo';
const AXI_ERA_RELIC = 'Axi';
const RELIC_ERAS = [LITH_ERA_RELIC, MESO_ERA_RELIC, NEO_ERA_RELIC, AXI_ERA_RELIC];

const collectRelicsToItemParts = itemName => {
	let relicsToItemParts = [];
	_.each(rewardsByRelics, (rewards, relic) => {
		const relicRewardByItem = pickRelicRewardByItem(rewards, itemName);
		if(!relicRewardByItem || unavailableRelics.includes(relic)) {
			return;
		}

		relicsToItemParts.push({relic, itemPart: relicRewardByItem.name, rarity: relicRewardByItem.rarity });
	});
	return relicsToItemParts;
}

const pickRelicRewardByItem = (relicsRewards, itemName) => {
	return _.find(relicsRewards, relicItem => relicItem.name.includes(itemName));
}

const mapRelicsByItemParts = relicsToItemParts => {
	let relicsByItemParts = {};
	_.each(relicsToItemParts, relicToItemPart => {
		const itemPart = relicToItemPart.itemPart;
		if(!_.has(relicsByItemParts, itemPart)) {
			relicsByItemParts[itemPart] = [];
		}
		relicsByItemParts[itemPart].push(relicToItemPart.relic);
	});
	return relicsByItemParts;
}

const isLithEra = era => LITH_ERA_RELIC === era;
const isMesoEra = era => MESO_ERA_RELIC === era;
const isNeoEra = era => NEO_ERA_RELIC === era;
const isAxiEra = era => AXI_ERA_RELIC === era;

const canBeFarmedOnBounties = relicsToItemParts => {
	const bountieRelics = _.filter(relicsToItemParts, 
		relicToItemPart => cetusRelics.includes(relicToItemPart.relic) && solarisRelics.includes(relicToItemPart.relic));
	return bountieRelics.length === relicsToItemParts.length; 
}

const retrieveRelicEra = relic => {
	return _.find(RELIC_ERAS, era => relic.includes(era));
}


module.exports = {
	collectRelicsToItemParts,
	mapRelicsByItemParts,
	isLithEra,
	isMesoEra,
	isNeoEra,
	isAxiEra,
	retrieveRelicEra,
	canBeFarmedOnBounties
}