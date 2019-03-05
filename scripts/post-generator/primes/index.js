const matter = require('gray-matter');

const generateFrontMatter = require('./generate-front-matter');
const generateIntro = require('./generate-intro');
const generateBody = require('./generate-body');
const generateEnding = require('./generate-ending');

const generateContent = (frontMatter) => {
	return generateIntro(frontMatter)
		+ generateBody(frontMatter)
		+ generateEnding(frontMatter);
}

module.exports = (params) => {
	const frontMatter = generateFrontMatter(params);
	const content = generateContent(frontMatter);
	return matter.stringify(content, frontMatter);
}