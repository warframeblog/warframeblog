module.exports = (frontMatter) => {
	const primed = frontMatter.primedItem;
	const alongWith = frontMatter.alongWith;
	if(frontMatter.unvaulted) {
		return `Hey guys. And the ${primed} Prime along with ${alongWith[0]} Prime and ${alongWith[1]} Prime﻿ have emerged from the `
		+ `Prime Vault. Today I'll be showing you which relics you'll need to farm to **get ${primed} Prime** and where you can farm `
		+ `these relics. <!--more-->`;
	} else {
		return `Hey guys. And the ${primed} Prime along with ${alongWith[0]} Prime and ${alongWith[1]} Prime﻿ have arrived in Warframe. `
		+ `Today I'll be showing you which relics you'll need to farm to **get ${primed} Prime** and where you can farm these `
		+ `relics. <!--more-->`;
	}
}