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

		relicsToItemParts.push({relic: relicName, itemPart: relicRewardByItem.name});
	});
	return relicsToItemParts;
}

const pickRelicRewardByItem = (relicsRewards, itemName) => {
	return _.find(relicsRewards, relicItem => relicItem.name.includes(itemName));
}

const collectRelicErasByItemParts = relicsToItemParts => {
	let relicErasByItemParts = {};
	_.each(relicsToItemParts, relicToItemPart => {
		const relicEra = _.find(RELIC_ERAS, era => relicToItemPart.relic.includes(era));
		if(!_.has(relicErasByItemParts, relicEra)) {
			relicErasByItemParts[relicEra] = [];
		}
		relicErasByItemParts[relicEra].push(relicToItemPart.itemPart);
	});
	return relicErasByItemParts;
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


module.exports = {
	collectRelicsToItemParts,
	collectRelicErasByItemParts,
	isLithEra,
	isMesoEra,
	isNeoEra,
	isAxiEra,
	canBeFarmedOnBounties
}