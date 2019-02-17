const _ = require('lodash');
const relicsByRewards = require('../../data/relics/relicsRewards');
const availableRelics = require('../../data/relics/availableRelics');
const unavailableRelics = require('../../data/relics/unavailableRelics');
const cetusRelics = require('../../data/relics/cetusRelics');
const solarisRelics = require('../../data/relics/solarisRelics');
const voidRelics = require('../../data/relics/voidRelics');
const sanctuaryRelics = require('../../data/relics/sanctuaryRelics');

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


module.exports = {
	collectRelicsToItemParts
}