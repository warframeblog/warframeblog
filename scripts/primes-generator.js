const fs = require('fs');
const join = require('path').join;
const matter = require('gray-matter');
const inquirer = require('inquirer');
const _ = require('lodash');
const converter = require('number-to-words');

const relicsUtils = require('./relics');

const PRIMES_FOLDER = join(__dirname, '../content', 'primes');

const questions = [
	{ type: 'input', name: 'primed', message: 'What have got primed?'},
	{ type: 'input', name: 'alongWith', message: 'Along with what it have got primed(Separate by comma)?'},
	{ type: 'input', name: 'image', message: 'Provide a link to the image:'},
];

const generateFrontMatter = contentDetails => {
	const primed = contentDetails.primed
	let frontMatter = {};
	frontMatter.title = `How To Get ${primed} Prime`;
	frontMatter.seoTitle = `How To Get ${primed} Prime. How To Farm ${primed} Prime Relics`;
	frontMatter.date = new Date();
	frontMatter.author = 'warframe';
	frontMatter.layout = 'post';
	frontMatter.permalink = `/primes/how-to-get-${primed.toLowerCase()}-prime/`;
	frontMatter.image = contentDetails.image;
	frontMatter.categories = ['Primes'];
	return frontMatter;
}

const generateContent = (contentDetails, allRelics, relicsToItemParts) => {
	let content = '';
	content += generateContentIntro(contentDetails);
	const relicsByItemParts = relicsUtils.mapRelicsByItemParts(relicsToItemParts);
	content += generateRelicsSection(contentDetails, relicsByItemParts);

	content += generateFarmingSection(contentDetails, relicsByItemParts);
	// content += generateBountiesRelicsFarmingSection(contentDetails, relicsToItemParts);
	content += generateEndingSection(contentDetails.primed);
	return content;
}

const generateContentIntro = contentDetails => {
	const primed = contentDetails.primed;
	const alongWith = contentDetails.alongWith.split(",");
	if(contentDetails.unvaulted) {
		return `Hey guys. And the ${primed} Prime along with ${alongWith[0]} Prime and ${alongWith[1]} Prime﻿ have emerged from the `
		+ `Prime Vault. Today I'll be showing you which relics you'll need to farm to get ${primed} Prime and where you can farm `
		+ `these relics. <!--more-->`;
	} else {
		return `Hey guys. And the ${primed} Prime along with ${alongWith[0]} Prime and ${alongWith[1]} Prime﻿ have arrived in Warframe. `
		+ `Today I'll be showing you which relics you'll need to farm to get ${primed} Prime and where you can farm these `
		+ `relics. <!--more-->`;
	}
}

const generateRelicsSection = (contentDetails, relicsByItemParts) => {
	const primed = contentDetails.primed;
	const sectionTitle = `\n\n## ${primed} Prime Relics`;
	console.log(relicsByItemParts)
	const relicsAmount = Object.values(relicsByItemParts).join(',').split(',').length;
	const sectionIntro = `\nSo, ${primed} Prime parts scattered across ${converter.toWords(relicsAmount)} different relics:\n`;
	const relicsList = generateRelicsList(relicsByItemParts);

	return sectionTitle + sectionIntro + relicsList;
}

const generateRelicsList = relicsByItemParts => {
	return _.map(relicsByItemParts, (relics, itemPart) => {
		const isOneRelic = relics.length === 1 ? 's' : '';
		return `\n* <b>${relics.join(', ')}</b> that drop${isOneRelic} the ${itemPart}`;
	}).join('');
}

const generateFarmingSection = (contentDetails, relicsByItemParts) => {
	const primed = contentDetails.primed;
	const farmingTitle = `\n\n## ${primed} Prime Relics Farming`;
	const farmingIntro = generateFarmingIntro(primed);

	const farmingRelicsByErasSection = generateFarmingRelicsByErasSection(primed, relicsByItemParts);

	return farmingTitle + farmingIntro + farmingRelicsByErasSection;
}

const generateFarmingIntro = primed => {
	return `\nBefore we proceed any further, I would like to say that all spots that I'll share with you are based on `
		+ `my personal experience <strong>farming ${primed} Prime relics</strong>. The spots gave me the necessary relics `
		+ `at the shortest time, but you may have a different result as relic drops are also based on a chance. `
		+ `Now, let's get on to the <strong>how to farm ${primed} Prime relics</strong> fast and easy.`;
}

const generateFarmingRelicsByErasSection = (primed, relicsByItemParts) => {
	const itemPartsToEras = _.map(relicsByItemParts, (relics, itemPart) => {
		const eras = _.chain(relics).map(relicsUtils.retrieveRelicEra).uniq().value();
		return {itemPart, eras};
	});

	let mergeByEra = {};
	for(let i = 0; i < itemPartsToEras.length; i++) {
		const current = itemPartsToEras[i]; 
		for(let j = i + 1; j < itemPartsToEras.length; j++) {
			if(_.isEqual(current.eras, itemPartsToEras[j].eras)) {
				const eras = current.eras.join(',');
				if(!_.has(mergeByEra, eras)) {
					mergeByEra[eras] = {};
					mergeByEra[eras].itemParts = current.itemPart + ' & ' + itemPartsToEras[j].itemPart;
					mergeByEra[eras].relics = relicsByItemParts[current.itemPart]
						.concat(relicsByItemParts[itemPartsToEras[j].itemPart]).join(', ');
					continue;
				}

				mergeByEra[eras].itemParts += ` & ${itemPartsToEras[j].itemPart}`;
				mergeByEra[eras].relics += ', ' + relicsByItemParts[itemPartsToEras[j].itemPart].join(', ');

			}
		}
	}

	let mentionedEras = {};
	let result = '';
	_.each(mergeByEra, (itemPartsToRelics, eras) => {
		const itemParts = itemPartsToRelics.itemParts;
		result += generateHowToGetPartTitle(itemParts);
		const erasArray = eras.split(',');
		erasArray.forEach(era => {
			mentionedEras[era] = itemParts;
			result += generateFarmingLocationsByEraParagraph(era)
		});
	});

	const restOfItemPartsToEras = _.filter(itemPartsToEras, itemPartToEras => {
		return !mergeByEra[itemPartToEras.eras.join(',')];
	});

	restOfItemPartsToEras.forEach(itemPartToEras => {
		const itemPart = itemPartToEras.itemPart;
		result += generateHowToGetPartTitle(itemPart);

		const eras = itemPartToEras.eras;
		const [notMentioned, mentioned] = _.partition(eras, era => !mentionedEras[era]);
		_.each(notMentioned, era => {
			mentionedEras[era] = itemPart;
			result +=  generateFarmingLocationsByEraParagraph(era);
		});
		_.each(mentioned, era => {
			const relics = relicsByItemParts[itemPart].filter(relic => relic.includes(era)).join(',');
			result += generateMentionedFarmingLocations(era, mentionedEras[era]);			
		});
	});
	return result;
}

const generateHowToGetPartTitle = itemParts => {
	return `\n\n### How To Get ${itemParts} Relics`;
}

const generateMentionedFarmingLocations = (era, itemPart) => {
	return `\n\nBesides that, you can get it by opening <b>${era} relics</b>. To farm these relics, I suggest you go to the same mission `
		+ `which I've already mentioned in _"How To Get ${itemPart} Relics" section_.`;
}

const generateFarmingLocationsByEraParagraph = era => {
	if(relicsUtils.isLithEra(era)) {
		return `\n\nFor <strong>farming Lith relics</strong> the <b>Orokin Derelict Defense</b> mission is a great option. `
		+ `ODD is a straightforward defense mission that you can even solo with banshee and you should be able to get two Lith `
		+ `relics in 10 waves most of the time.`;
	} else if(relicsUtils.isMesoEra(era)) {
		return `\n\nIn order to farm <b>Meso relics</b>, I would recommend <b>IO on Jupiter</b>. This mission can be completed really quickly and `
		+ `with some luck, you should be able to get two Meso relics in 10 waves.`;
	} else if(relicsUtils.isNeoEra(era)) {
		return `\n\nFor <b>Neo relics</b>, my recommendation is <b>Hydron on Sedna</b>. It is the fastest way to farm for Neo relics `
		+ `because Neo relics drop every 5 rounds. Also, it worth mentioned that Hydron is the best area to level up your Warframe `
		+ `and weapons. So, don't forget to bring alongside your weapons that you want to level up.`;
	} else if(relicsUtils.isAxiEra(era)) {
		return `\n\nFor <b>Axi relics farming</b> I would recommend <b>Xini on Eris</b>. It's an interception mission that's pretty `
		+ `straightforward. The first two rounds drop Neo relics and rounds 3 and 4 regularly dropping Axi relics. Optimally you `
		+ `want to stay four rounds before extracting.`
		+ `\n\nXini also has a high Neurodes drop, so be sure to keep an eye for [Neurodes](/warframe-neurodes-farming/ "Warframe `
		+ `Neurodes Farming").`;
	}
	return '';
}

const generateBountiesRelicsFarmingSection = (contentDetails, relicsToItemParts) => {
	if(relicsUtils.canBeFarmedOnBounties(relicsToItemParts)) {
		const bountiesRelicsTitle = `\n\n## Farming ${contentDetails.primed} Prime Relics in Bounties`;
		const bountiesRelicsIntro = `\nBounties are a fantastic way to get relics as well. You can take up the bounties from Cetus or `
		+ `[Fortuna](/fortuna/ "Warframe Fortuna") both will yield similar results. With tier 2 bounties granting Lith relics, tier 3 `
		+ `bounties granting Meso relics, tier 4 bounties granting Neo relics, and tier 5 bounties granting Axi relics.`;

		return bountiesRelicsTitle + bountiesRelicsIntro;
	}

	return '';
}

const generateEndingSection = primed => {
	return `\n\nAnd that’s pretty much all I want to say about <strong>${primed} Prime Relics farming</strong>. `
		+ `I hope this guide helped and good luck with farming. Bye-bye.`
}

inquirer.prompt(questions)
	.then(contentDetails => {
		const primed = contentDetails.primed;
		const frontMatter = generateFrontMatter(contentDetails);
		const relicsToItemParts = relicsUtils.collectRelicsToItemParts(primed)

		const content = generateContent(contentDetails, {}, relicsToItemParts);
		// console.log(content);
		const fileContent = matter.stringify(content, frontMatter);

		const pathToFile = join(PRIMES_FOLDER, `how-to-get-${primed.toLowerCase()}-prime.md`);
		fs.writeFileSync(pathToFile, fileContent);
	}).catch(e => console.log(e));