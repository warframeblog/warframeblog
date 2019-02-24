const _ = require('lodash');
const relicsByRewards = require('../../data/relics/relicsRewards');
const availableRelics = require('../../data/relics/availableRelics');
const unavailableRelics = require('../../data/relics/unavailableRelics');
const cetusRelics = require('../../data/relics/cetusRelics');
const solarisRelics = require('../../data/relics/solarisRelics');
const relicsByMissions = require('../../data/relics/missionRelics');

const LITH_ERA_RELIC = 'Lith';
const MESO_ERA_RELIC = 'Meso';
const NEO_ERA_RELIC = 'Neo';
const AXI_ERA_RELIC = 'Axi';
const RELIC_ERAS = [LITH_ERA_RELIC, MESO_ERA_RELIC, NEO_ERA_RELIC, AXI_ERA_RELIC];

const collectRelicsToItemParts = itemName => {
	let relicsToItemParts = [];
	_.each(relicsByRewards, (relicsRewards, relicName) => {
		const relicRewardByItem = pickRelicRewardByItem(relicsRewards, itemName);
		if(!relicRewardByItem || unavailableRelics.includes(relicName)) {
			return;
		}

		relicsToItemParts.push({relic: relicName, itemPart: relicRewardByItem.name, rarity: relicRewardByItem.rarity });
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