const fs = require('fs');
const join = require('path').join;
const matter = require('gray-matter');

const PostGenerator = require('./post-generator');
const PRIMES_FOLDER = join(__dirname, '../content', 'primes');

const files = fs.readdirSync(PRIMES_FOLDER);
files.forEach(file => {
	const pathToFile = join(PRIMES_FOLDER, file);
	const content = fs.readFileSync(pathToFile, 'utf8');
    const contentFile = matter(content);
	
	const prevFrontMatter = contentFile.data;
	const isPost = prevFrontMatter.layout === 'post';
	const isGenerated = prevFrontMatter.generated === true;
	if(isPost && isGenerated) {
		const fileContent = PostGenerator.generate({type: PostGenerator.TYPES.primes,  params: {prevFrontMatter}});
		fs.writeFileSync(pathToFile, fileContent);
		console.log(`${pathToFile} was updated`);
	}
});