const fs = require('fs');
const join = require('path').join;
const axios = require('axios');
const matter = require('gray-matter');
const inquirer = require('inquirer');
const cheerio = require('cheerio');
const _ = require('lodash');
const unvaultedPrimedItems = require('../data/unvaulted');

const PRIMES_FOLDER = join(__dirname, '../content', 'primes');
const LITH_ERA_RELIC = 'Lith';
const MESO_ERA_RELIC = 'Meso';
const NEO_ERA_RELIC = 'Neo';
const AXI_ERA_RELIC = 'Axi';
const RELIC_ERAS = [LITH_ERA_RELIC, MESO_ERA_RELIC, NEO_ERA_RELIC, AXI_ERA_RELIC];
const DROPS_PAGE_URL = 'https://n8k6e2y6.ssl.hwcdn.net/repos/hnfvc0o3jnfvc873njb03enrf56.html';

const questions = [
	{ type: 'input', name: 'primed', message: 'What have got primed?'},
	{ type: 'input', name: 'alongWith', message: 'Along with what it have got primed(Separate by comma)?'},
	{ type: 'input', name: 'image', message: 'Provide a link to the image:'},
];

const gutherRelics = dropsPage => {
	const $ = cheerio.load(dropsPage);
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

const findRequiredRelics = (allRelics, relicsOfUnvaultedItem, primed) => {
	let requiredRelics = [];
	_.forOwn(allRelics, (items, relicName) => {
		if(relicsOfUnvaultedItem && !relicsOfUnvaultedItem.includes(relicName)) {
			return;
		}
		_.forEach(items, function(item) {
			if(item.name.includes(primed)) {
				const relic = {
					name: relicName,
					item: item.name,
					rarity: item.rarity
				}
				requiredRelics.push(relic);
				return;
			}
		});
	});
	return requiredRelics;
}

const generateContent = (contentDetails, requiredRelics) => {
	let content = '';
	content += generateContentIntro(contentDetails);
	content += generateRelicsSection(contentDetails, requiredRelics);
	content += generateFarmingSection(contentDetails, requiredRelics);
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

const generateRelicsSection = (contentDetails, requiredRelics) => {
	const primed = contentDetails.primed;
	const sectionTitle = `\n\n## ${primed} Prime Relics`;
	const relicsAmount = requiredRelics.length;
	const sectionIntro = `\nSo, ${primed} Prime parts scattered across ${convertNumberIntoWords(relicsAmount)} different relics:\n`;
	const relicsList = generateRelicsList(requiredRelics);

	return sectionTitle + sectionIntro + relicsList;
}

const convertNumberIntoWords = number => {
	if(number === 3) {
		return 'three';
	} else if(number === 4) {
		return 'four';
	}
	return null;
}

const generateRelicsList = relics => {
	return _.map(relics, relic => {
		return `\n* <b>${relic.name}</b> that drops the ${relic.item}`;
	}).join('');
}

const generateFarmingSection = (contentDetails, requiredRelics) => {
	const primed = contentDetails.primed;
	const farmingTitle = `\n\n## ${primed} Prime Relics Farming`;
	const farmingIntro = generateFarmingIntro(primed);

	const primedPartsByEras = retrievePrimedPartsByRelicEras(requiredRelics);
	const farmingRelicsByErasSection = generateFarmingRelicsByErasSection(primed, primedPartsByEras);

	return farmingTitle + farmingIntro + farmingRelicsByErasSection;
}

const generateFarmingIntro = primed => {
	return `\nBefore we proceed any further, I would like to say that all spots that I'll share with you are based on `
		+ `my personal experience <strong>farming ${primed} Prime relics</strong>. The spots gave me the necessary relics `
		+ `at the shortest time, but you may have a different result as relic drops are also based on a chance. `
		+ `Now, let's get on to the <strong>how to farm ${primed} Prime relics</strong> fast and easy.`;
}

const retrievePrimedPartsByRelicEras = relics => {
	let primedPartsByEras = {};
	_.each(relics, relic => {
		const relicName = relic.name;
		const relicEra = _.filter(RELIC_ERAS, era => relicName.includes(era));
		if(!primedPartsByEras.hasOwnProperty(relicEra)) {
			primedPartsByEras[relicEra] = [];
		}

		primedPartsByEras[relicEra].push(relic.item);
	});
	return primedPartsByEras;
}

const generateFarmingRelicsByErasSection = (primed, primedPartsByEras) => {
	return _.map(primedPartsByEras, (primedParts, era) => {
		return generateHowToGetPartTitle(primedParts) 
			+ generateFarmingLocationsByEraParagraph(era);
	}).join('');
}

const generateHowToGetPartTitle = primedParts => {
	return `\n\n### How To Get ${primedParts.join(' & ')} relics`;
}

const generateFarmingLocationsByEraParagraph = era => {
	if(LITH_ERA_RELIC === era) {
		return `\nSo, for <strong>farming Lith relics</strong> the <b>Orokin Derelict Defense</b> mission is a great option. `
		+ `ODD is a straightforward defense mission that you can even solo with banshee and you should be able to get two Lith `
		+ `relics in 10 waves most of the time.`;
	} else if(MESO_ERA_RELIC === era) {
		return `\nIn order to farm <b>Meso relics</b>, I would recommend <b>IO on Jupiter</b>. This mission can be completed really quickly and `
		+ `with some luck, you should be able to get two Meso relics in 10 waves.`;
	} else if(NEO_ERA_RELIC === era) {
		return `\nFor <b>Neo relics</b>, my recommendation is <b>Hydron on Sedna</b>. It is the fastest way to farm for Neo relics `
		+ `because Neo relics drop every 5 rounds. Also, it worth mentioned that Hydron is the best area to level up your Warframe `
		+ `and weapons. So, don't forget to bring alongside your weapons that you want to level up.`;
	} else if(AXI_ERA_RELIC === era) {
		return `\nFor <b>Axi relics farming</b> I would recommend <b>Xini on Eris</b>. It's an interception mission that's pretty `
		+ `straightforward. The first two rounds drop Neo relics and rounds 3 and 4 regularly dropping Axi relics. Optimally you `
		+ `want to stay four rounds before extracting.`
		+ `\n\nXini also has a high Neurodes drop, so be sure to keep an eye for [Neurodes](/warframe-neurodes-farming/ "Warframe `
		+ `Neurodes Farming").`;
	}
	return '';
}

const generateEndingSection = primed => {
	return `\n\nAnd that’s pretty much all I want to say about <strong>${primed} Prime Relics farming</strong>. `
		+ `I hope this guide helped and good luck with farming. Bye-bye.`
}

const findRelicsOfUnvaultedItem = primed => {
	return _.get(unvaultedPrimedItems, `${primed} Prime`);
}

Promise.all([inquirer.prompt(questions), axios.get(DROPS_PAGE_URL)])
	.then((result) => {
		const contentDetails = result[0];
		const dropsPageResponse = result[1];
		if(!contentDetails || !dropsPageResponse) {
			throw new Error('Something went wrong');
		}
		const allRelics = gutherRelics(dropsPageResponse.data);

		const primed = contentDetails.primed;
		const frontMatter = generateFrontMatter(contentDetails);

		const relicsOfUnvaultedItem = findRelicsOfUnvaultedItem(primed);
		contentDetails.unvaulted = !relicsOfUnvaultedItem ? false : true;
		console.log(contentDetails.unvaulted)
		const requiredRelics = findRequiredRelics(allRelics, relicsOfUnvaultedItem, primed);
		console.log(requiredRelics);
		const content = generateContent(contentDetails, requiredRelics);
		const fileContent = matter.stringify(content, frontMatter);

		// const pathToFile = join(PRIMES_FOLDER, `how-to-get-${primed.toLowerCase()}-prime.md`);
		// fs.writeFileSync(pathToFile, fileContent);
	}).catch(e => console.log(e));