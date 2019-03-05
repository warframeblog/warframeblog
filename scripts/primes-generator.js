const fs = require('fs');
const join = require('path').join;
const matter = require('gray-matter');
const inquirer = require('inquirer');
const _ = require('lodash');
const converter = require('number-to-words');

const PostGenerator = require('./post-generator');
const PRIMES_FOLDER = join(__dirname, '../content', 'primes');

const questions = [
	{ type: 'input', name: 'primedItem', message: 'What have got primed?'},
	{ type: 'input', name: 'alongWith', message: 'Along with what it have got primed(Separate by comma)?'},
	{ type: 'input', name: 'image', message: 'Provide a link to the image:'},
];

inquirer.prompt(questions)
	.then(contentDetails => {
		const fileContent = PostGenerator.generate({type: PostGenerator.TYPES.primes,  params: contentDetails});

		const primedItem = contentDetails.primedItem;
		const pathToFile = join(PRIMES_FOLDER, `how-to-get-${primedItem.toLowerCase()}-prime.md`);
		fs.writeFileSync(pathToFile, fileContent);
	}).catch(e => console.log(e));