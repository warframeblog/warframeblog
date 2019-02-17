const _ = require('lodash');
const relicsByRewards = require('../../data/relics/relicsRewards');
const cetusRelics = require('../../data/relics/cetusRelics');
const solarisRelics = require('../../data/relics/solarisRelics');
const voidRelics = require('../../data/relics/voidRelics');
const unvaultedRelics = require('../../data/relics/unvaultedRelics');
const sanctuaryRelics = require('../../data/relics/sanctuaryRelics');

const collectRelicsToItemParts = itemName => {
	let relicsToItemParts = [];
	_.each(relicsByRewards, (relicsRewards, relicName) => {
		const relicRewardByItem = pickRelicRewardByItem(relicsRewards, itemName);
		if(!relicRewardByItem) {
			return;
		}

		relicsToItemParts.push({relic: relicName, itemPart: relicRewardByItem.name});
	});
	return hasUnvaultedRelics(relicsToItemParts) ? pickOnlyUnvaultedRelics(relicsToItemParts) : relicsToItemParts;
}

const pickRelicRewardByItem = (relicsRewards, itemName) => {
	return _.find(relicsRewards, relicItem => relicItem.name.includes(itemName));
}

const hasUnvaultedRelics = relicsToItemParts => {
	return _.some(relicsToItemParts, isOneOfUnvaultedRelics);
}

const pickOnlyUnvaultedRelics = relicsToItemParts => {
	return _.values(_.pickBy(relicsToItemParts, isOneOfUnvaultedRelics));
}

const isOneOfUnvaultedRelics = relicToItemPart => {
	return unvaultedRelics.includes(relicToItemPart.relic);
}


module.exports = {
	collectRelicsToItemParts
}