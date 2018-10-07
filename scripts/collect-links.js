const fs = require('fs');
const join = require('path').join;
const matter = require('gray-matter');

const CONTENT_FOLDER = join(__dirname, '../content');
const REGEX = /\[([A-Za-z\s0-9.?]+)\]\(([\/:a-z-.0-9]+)\s?\"?([a-zA-Z\s:0-9?.-]+)?\"?\)/g;

const fileNames = fs.readdirSync(CONTENT_FOLDER);
fileNames.forEach(fileName => {
	const path = join(CONTENT_FOLDER, fileName);
	if(!fs.lstatSync(path).isFile()) {
		return;
	}
	const content = fs.readFileSync(path, 'utf8');

	try {
		const contentFile = matter(content);

		const res = REGEX.exec(contentFile.content);
		if(res) {
			console.log(`${res[1]} - ${res[2]} - ${res[3]}`)
		}
	} catch(e) {
		console.error(`Cannot parse file correctly ${path} - ${e}`)
	}
});