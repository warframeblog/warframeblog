const fs = require('fs');
const join = require('path').join;
const axios = require('axios');
const matter = require('gray-matter');
const inquirer = require('inquirer');
const cheerio = require('cheerio');
const _ = require('lodash');

const PRIMES_FOLDER = join(__dirname, '../content', 'primes');
const RELIC_ERAS = ['Lith', 'Meso', 'Neo', 'Axi'];
const DROPS_PAGE_URL = 'https://n8k6e2y6.ssl.hwcdn.net/repos/hnfvc0o3jnfvc873njb03enrf56.html';

const questions = [
	{ type: 'input', name: 'primed', message: 'What have got primed?'},
	{ type: 'confirm', name: 'unvaulted', message: 'It it unvaulted?', default: false },
	{ type: 'input', name: 'alongWith', message: 'Along with what it have got primed?(Separate by comma)'}
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

const generateFrontMatter = primed => {
	let frontMatter = {};
	frontMatter.title = `How To Get ${primed} Prime`;
	frontMatter.seoTitle = `How To Get ${primed} Prime. How To Farm ${primed} Prime Relics`;
	frontMatter.date = new Date();
	frontMatter.author = 'warframe';
	frontMatter.layout = 'post';
	frontMatter.permalink = `/primes/how-to-get-${primed.toLowerCase()}-prime/`;
	frontMatter.categories = ['Primes'];
	return frontMatter;
}

const findRequiredRelics = (relics, primed) => {
	let requiredRelics = [];
	_.forOwn(relics, function(items, relicName) {
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
		return ``;
	} else {
		return `Hey guys. And the ${primed} Prime along with ${alongWith[0]} Prime and ${alongWith[1]} Prime﻿ have arrived in Warframe.` + 
		`Today I'll be showing you which relics you'll need to farm to get ${primed} Prime and where you can farm these relics. <!--more-->`;
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
	return '';
}

const generateEndingSection = primed => {
	return `\n\nAnd that’s pretty much all I want to say about <strong>${primed} Relics farming</strong>. `
		+ `I hope this guide helped and good luck with farming. Bye-bye.`
}

Promise.all([inquirer.prompt(questions), axios.get(DROPS_PAGE_URL)])
	.then((result) => {
		const answers = result[0];
		const dropsPageResponse = result[1];
		if(!answers || !dropsPageResponse) {
			throw new Error('Something went wrong');
		}
		const allRelics = gutherRelics(dropsPageResponse.data);

		const primed = answers.primed;
		// const frontMatter = generateFrontMatter(primed);
		// console.log(frontMatter);
		const requiredRelics = findRequiredRelics(allRelics, primed);
		const content = generateContent(answers, requiredRelics);
		console.log(content);
		// const fileContent = matter.stringify(content, frontMatter);
		// const pathToFile = join(PRIMES_FOLDER, `how-to-get-${primed.toLowerCase()}-prime.md`);
		// fs.writeFileSync(pathToFile, fileContent);

	}).catch(e => console.log(e));