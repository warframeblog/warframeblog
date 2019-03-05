module.exports = (params) => {
	const prevFrontMatter = params.prevFrontMatter;
	return !prevFrontMatter ? generateNewFrontMatter(params) : updatePrevFrontMatter(params);
}

const generateNewFrontMatter = ({primedItem, alongWith, image}) => {
	let frontMatter = {};
	frontMatter.title = `How To Get ${primedItem} Prime`;
	frontMatter.seoTitle = `How To Get ${primedItem} Prime. How To Farm ${primedItem} Prime Relics`;
	frontMatter.date = new Date();
	frontMatter.author = 'warframe';
	frontMatter.layout = 'post';
	frontMatter.permalink = `/primes/how-to-get-${primedItem.toLowerCase()}-prime/`;
	frontMatter.categories = ['Primes'];
	frontMatter.generated = true;
	frontMatter.primedItem = primedItem;
	frontMatter.image = image ? image : '';
	frontMatter.alongWith = alongWith ? alongWith.split(',') : [];
	return frontMatter;
}

const updatePrevFrontMatter = ({prevFrontMatter}) => {
	//TODO clone prevFrontMatter instead
	let frontMatter = prevFrontMatter;
	frontMatter.date = new Date();
	return frontMatter;
}