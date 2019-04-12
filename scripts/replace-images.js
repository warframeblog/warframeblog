const fs = require('fs');
const join = require('path').join;
const cheerio = require('cheerio');

const CONTENT_FOLDER = join(__dirname, '../content');
const IMG_REGEX = /<img.+\/>/im;
const DOMAIN_REGEX = /https:\/\/warframeblog\.com/g;

const fileNames = fs.readdirSync(CONTENT_FOLDER);
fileNames.forEach(fileName => {
	const path = join(CONTENT_FOLDER, fileName);
	if(!fs.lstatSync(path).isFile()) {
		return;
	}

	const contentBuf = fs.readFileSync(path);
	let content = contentBuf.toString();
	while (IMG_REGEX.test(content)) {
		const match = IMG_REGEX.exec(content);
		const imageHtml = match[0];
		const $ = cheerio.load(imageHtml);
		const title = $('img').attr('title') ? $('img').attr('title') : '';
		const alt = $('img').attr('alt') ? $('img').attr('alt') : '';
		const src = $('img').attr('src').replace(DOMAIN_REGEX, '');
		const srcset = $('img').attr('srcset') ? $('img').attr('srcset').replace(DOMAIN_REGEX, '') : '';
		if(!title || !alt || !srcset) {
			console.log(`${path} important attributes are empty`);
		}
		const imageShortcode = `{{< image title="${title}" alt="${alt}" src="${src}" srcset="${srcset}">}}`;
		content = content.substring(0, match.index) 
			+ imageShortcode
			+ content.substring(match.index + imageHtml.length);
	}
	fs.writeFileSync(path, content);
});