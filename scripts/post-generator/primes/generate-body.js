const converter = require('number-to-words');
const _ = require('lodash');

const relicsUtils = require('../../relics');

module.exports = (frontMatter) => {
	const relicsToItemParts = relicsUtils.collectRelicsToItemParts(frontMatter.primedItem);
	const relicsByItemParts = relicsUtils.mapRelicsByItemParts(relicsToItemParts);

	return generateRelicsSection(frontMatter, relicsByItemParts) 
		+ generateFarmingSection(frontMatter, relicsByItemParts);
		// + generateBountiesRelicsFarmingSection(frontMatter, relicsToItemParts);
}

const generateRelicsSection = ({primedItem}, relicsByItemParts) => {
	const sectionTitle = `\n\n## ${primedItem} Prime Relics`;
	console.log(relicsByItemParts)
	const relicsAmount = Object.values(relicsByItemParts).join(',').split(',').length;
	const sectionIntro = `\nSo, **${primedItem} Prime parts** scattered across ${converter.toWords(relicsAmount)} different relics:\n`;
	const relicsList = generateRelicsList(relicsByItemParts);

	return sectionTitle + sectionIntro + relicsList;
}

const generateRelicsList = relicsByItemParts => {
	return _.map(relicsByItemParts, (relics, itemPart) => {
		const isOneRelic = relics.length === 1 ? 's' : '';
		return `\n* <b>${relics.join(', ')}</b> that drop${isOneRelic} the ${itemPart}`;
	}).join('');
}

const generateFarmingSection = ({primedItem}, relicsByItemParts) => {
	const farmingTitle = `\n\n## ${primedItem} Prime Relics Farming`;
	const farmingIntro = generateFarmingIntro(primedItem);

	const farmingRelicsByErasSection = generateFarmingRelicsByErasSection(primedItem, relicsByItemParts);

	return farmingTitle + farmingIntro + farmingRelicsByErasSection;
}

const generateFarmingIntro = primedItem => {
	return `\nBefore we proceed any further, I would like to say that all spots that I'll share with you are based on `
		+ `my personal experience <strong>farming ${primedItem} Prime relics</strong>. The spots gave me the necessary relics `
		+ `at the shortest time, but you may have a different result as relic drops are also based on a chance. `
		+ `Now, let's get on to the <strong>how to farm ${primedItem} Prime relics</strong> fast and easy.`;
}

const generateFarmingRelicsByErasSection = (primed, relicsByItemParts) => {
	const itemPartsToEras = _.map(relicsByItemParts, (relics, itemPart) => {
		const eras = _.chain(relics).map(relicsUtils.retrieveRelicEra).uniq().value();
		return {itemPart, eras};
	});

	let mergeByEras = {};
	for(let i = 0; i < itemPartsToEras.length; i++) {
		const current = itemPartsToEras[i]; 
		for(let j = i + 1; j < itemPartsToEras.length; j++) {
			if(_.isEqual(current.eras, itemPartsToEras[j].eras)) {
				const eras = current.eras.join(',');
				if(!_.has(mergeByEras, eras)) {
					mergeByEras[eras] = {};
					mergeByEras[eras].itemParts = current.itemPart + ' & ' + itemPartsToEras[j].itemPart;
					mergeByEras[eras].relics = relicsByItemParts[current.itemPart]
						.concat(relicsByItemParts[itemPartsToEras[j].itemPart]).join(', ');
					continue;
				}

				mergeByEras[eras].itemParts += ` & ${itemPartsToEras[j].itemPart}`;
				mergeByEras[eras].relics += ', ' + relicsByItemParts[itemPartsToEras[j].itemPart].join(', ');

			}
		}
	}

	let mentionedEras = {};
	let result = '';
	_.each(mergeByEras, (itemPartsToRelics, eras) => {
		const itemParts = itemPartsToRelics.itemParts;
		result += generateHowToGetPartTitle(itemParts);
		const erasArray = eras.split(',');
		erasArray.forEach(era => {
			mentionedEras[era] = itemParts;
			const itemPart = itemParts.split(' & ')[0];
			const relics = relicsByItemParts[itemPart].filter(relic => relic.includes(era)).join(',');
			result += generateFarmingLocationInfoByEra(era, relics)
		});
	});

	const restOfItemPartsToEras = _.filter(itemPartsToEras, itemPartToEras => {
		return !mergeByEras[itemPartToEras.eras.join(',')];
	});

	restOfItemPartsToEras.forEach(itemPartToEras => {
		const itemPart = itemPartToEras.itemPart;
		result += generateHowToGetPartTitle(itemPart);

		const eras = itemPartToEras.eras;
		const [notMentioned, mentioned] = _.partition(eras, era => !mentionedEras[era]);
		_.each(notMentioned, era => {
			mentionedEras[era] = itemPart;
			const relics = relicsByItemParts[itemPart].filter(relic => relic.includes(era)).join(',');
			result +=  generateFarmingLocationInfoByEra(era, relics);
		});
		_.each(mentioned, era => {
			const relics = relicsByItemParts[itemPart].filter(relic => relic.includes(era)).join(',');
			if(notMentioned.length === 0) {
				result += generateMentionedFarmingLocationAsFirst(relics, mentionedEras[era]);			
			} else {
				result += generateMentionedFarmingLocation(relics, mentionedEras[era]);			
			}
		});
	});
	return result;
}

const generateHowToGetPartTitle = itemParts => {
	return `\n\n### How To Get ${itemParts} Relics`;
}

const generateMentionedFarmingLocationAsFirst = (relics, itemPart) => {
	return `\n\nYou can get it by opening <b>${relics} Relics</b>. To farm these relics, I suggest you go to the same mission which `
		+ `I've already mentioned in _"How To Get ${itemPart} Relics"_ section.`
}

const generateMentionedFarmingLocation = (relics, itemPart) => {
	return `\n\nBesides that, you can get it by opening <b>${relics} Relics</b>. To farm these relics, I suggest you go to the same mission `
		+ `which I've already mentioned in _"How To Get ${itemPart} Relics" section_.`;
}

const generateFarmingLocationInfoByEra = (era, relics) => {
	if(relicsUtils.isLithEra(era)) {
		return `\n\nFor <strong>farming ${relics} Relics</strong> the <b>Orokin Derelict Defense</b> mission is a great option. `
		+ `ODD is a straightforward defense mission that you can even solo with banshee and you should be able to get two Lith `
		+ `relics in 10 waves most of the time.`;
	} else if(relicsUtils.isMesoEra(era)) {
		return `\n\nIn order to farm <b>${relics} Relics</b>, I would recommend <b>IO on Jupiter</b>. This mission can be completed really quickly and `
		+ `with some luck, you should be able to get two Meso relics in 10 waves.`;
	} else if(relicsUtils.isNeoEra(era)) {
		return `\n\nFor <b>${relics} Relics</b>, my recommendation is <b>Hydron on Sedna</b>. It is the fastest way to farm for Neo relics `
		+ `because Neo relics drop every 5 rounds. Also, it worth mentioned that Hydron is the best area to level up your Warframe `
		+ `and weapons. So, don't forget to bring alongside your weapons that you want to level up.`;
	} else if(relicsUtils.isAxiEra(era)) {
		return `\n\nFor <b>${relics} Relics farming</b> I would recommend <b>Xini on Eris</b>. It's an interception mission that's pretty `
		+ `straightforward. The first two rounds drop Neo relics and rounds 3 and 4 regularly dropping Axi relics. Optimally you `
		+ `want to stay four rounds before extracting.`
		+ `\n\nXini also has a high Neurodes drop, so be sure to keep an eye for [Neurodes](/warframe-neurodes-farming/ "Warframe `
		+ `Neurodes Farming").`;
	}
	return '';
}

// const generateBountiesRelicsFarmingSection = (contentDetails, relicsToItemParts) => {
// 	if(relicsUtils.canBeFarmedOnBounties(relicsToItemParts)) {
// 		const bountiesRelicsTitle = `\n\n## Farming ${contentDetails.primed} Prime Relics in Bounties`;
// 		const bountiesRelicsIntro = `\nBounties are a fantastic way to get relics as well. You can take up the bounties from Cetus or `
// 		+ `[Fortuna](/fortuna/ "Warframe Fortuna") both will yield similar results. With tier 2 bounties granting Lith relics, tier 3 `
// 		+ `bounties granting Meso relics, tier 4 bounties granting Neo relics, and tier 5 bounties granting Axi relics.`;

// 		return bountiesRelicsTitle + bountiesRelicsIntro;
// 	}

// 	return '';
// }