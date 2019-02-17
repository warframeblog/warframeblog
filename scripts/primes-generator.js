const fs = require('fs');
const join = require('path').join;
const matter = require('gray-matter');
const inquirer = require('inquirer');
const _ = require('lodash');

const relics = require('./relics');

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
	content += generateRelicsSection(contentDetails, relicsToItemParts);

	const relicErasByItemParts = relics.collectRelicErasByItemParts(relicsToItemParts);
	content += generateFarmingSection(contentDetails, relicsToItemParts, relicErasByItemParts);
	content += generateBountiesRelicsFarmingSection(contentDetails, relicsToItemParts, relicErasByItemParts)
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

const generateRelicsSection = (contentDetails, relicsToItemParts) => {
	const primed = contentDetails.primed;
	const sectionTitle = `\n\n## ${primed} Prime Relics`;
	const relicsAmount = relicsToItemParts.length;
	const sectionIntro = `\nSo, ${primed} Prime parts scattered across ${convertNumberIntoWords(relicsAmount)} different relics:\n`;
	const relicsList = generateRelicsList(relicsToItemParts);

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

const generateRelicsList = relicsToItemParts => {
	return _.map(relicsToItemParts, relicToItemPart => {
		return `\n* <b>${relicToItemPart.relic}</b> that drops the ${relicToItemPart.itemPart}`;
	}).join('');
}

const generateFarmingSection = (contentDetails, relicsToItemParts, relicErasByItemParts) => {
	const primed = contentDetails.primed;
	const farmingTitle = `\n\n## ${primed} Prime Relics Farming`;
	const farmingIntro = generateFarmingIntro(primed);

	const farmingRelicsByErasSection = generateFarmingRelicsByErasSection(primed, relicErasByItemParts);

	return farmingTitle + farmingIntro + farmingRelicsByErasSection;
}

const generateFarmingIntro = primed => {
	return `\nBefore we proceed any further, I would like to say that all spots that I'll share with you are based on `
		+ `my personal experience <strong>farming ${primed} Prime relics</strong>. The spots gave me the necessary relics `
		+ `at the shortest time, but you may have a different result as relic drops are also based on a chance. `
		+ `Now, let's get on to the <strong>how to farm ${primed} Prime relics</strong> fast and easy.`;
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
	if(relics.isLithEra(era)) {
		return `\nSo, for <strong>farming Lith relics</strong> the <b>Orokin Derelict Defense</b> mission is a great option. `
		+ `ODD is a straightforward defense mission that you can even solo with banshee and you should be able to get two Lith `
		+ `relics in 10 waves most of the time.`;
	} else if(relics.isMesoEra(era)) {
		return `\nIn order to farm <b>Meso relics</b>, I would recommend <b>IO on Jupiter</b>. This mission can be completed really quickly and `
		+ `with some luck, you should be able to get two Meso relics in 10 waves.`;
	} else if(relics.isNeoEra(era)) {
		return `\nFor <b>Neo relics</b>, my recommendation is <b>Hydron on Sedna</b>. It is the fastest way to farm for Neo relics `
		+ `because Neo relics drop every 5 rounds. Also, it worth mentioned that Hydron is the best area to level up your Warframe `
		+ `and weapons. So, don't forget to bring alongside your weapons that you want to level up.`;
	} else if(relics.isAxiEra(era)) {
		return `\nFor <b>Axi relics farming</b> I would recommend <b>Xini on Eris</b>. It's an interception mission that's pretty `
		+ `straightforward. The first two rounds drop Neo relics and rounds 3 and 4 regularly dropping Axi relics. Optimally you `
		+ `want to stay four rounds before extracting.`
		+ `\n\nXini also has a high Neurodes drop, so be sure to keep an eye for [Neurodes](/warframe-neurodes-farming/ "Warframe `
		+ `Neurodes Farming").`;
	}
	return '';
}

const generateBountiesRelicsFarmingSection = (contentDetails, relicsToItemParts, relicErasByItemParts) => {
	if(relics.canBeFarmedOnBounties(relicsToItemParts)) {
		const bountiesRelicsTitle = `\n\n## Farming ${contentDetails.primed} Prime Relics in Bounties`;
		const bountiesRelicsIntro = `\nBounties are a fantastic way to get relics as well. You can take up the bounties from Cetus or `
		+ `[Fortuna](/fortuna/ "Warframe Fortuna") both will yield similar results. `;


		// `With tier 2 bounties granting Lith relics, tier 3 `
		// + `bounties granting Meso relics, tier 4 bounties granting Neo relics, and tier 5 bounties granting Axi relics.`;

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
		const relicsToItemParts = relics.collectRelicsToItemParts(primed)

		const content = generateContent(contentDetails, {}, relicsToItemParts);
		console.log(content);
		// const fileContent = matter.stringify(content, frontMatter);

		// const pathToFile = join(PRIMES_FOLDER, `how-to-get-${primed.toLowerCase()}-prime.md`);
		// fs.writeFileSync(pathToFile, fileContent);
	}).catch(e => console.log(e));