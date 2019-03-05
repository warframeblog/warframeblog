const primesPostGenerator = require('./primes');

const TYPES = { primes: 'primes' };

const GENERATORS_FOR_TYPE = {
	primes: primesPostGenerator
}

const generate = ({type, params}) => {
	return GENERATORS_FOR_TYPE[type](params);
}

module.exports = {
	TYPES, generate
}