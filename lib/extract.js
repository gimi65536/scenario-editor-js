import nunjucks from 'nunjucks';
import lodash from 'lodash';

const texEnv = new nunjucks.Environment(new nunjucks.WebLoader('/'), {
	autoescape: false,
	tags: {
		blockStart: '{&',
		blockEnd: '&}',
		variableStart: '{|',
		variableEnd: '|}'
	}
}).addFilter('etex', (s) => {
	let result = '';
	if(result === undefined || result === null){
		return '';
	}
	for(const c of s){
		if (c == '\\') result += '\\textbackslash '
		else if (c == '~') result += '\\textasciitilde '
		else if (c == '{') result += '\\{'
		else if (c == '}') result += '\\}'
		else if (c == '&') result += '\\&'
		else if (c == ' ') result += '~'
		else result += c
	}
	return result;
}).addFilter('reorderspeakers', (speakers_list, scenario) => { // Pythonic naming sense
	return speakers_list.toSorted((a, b) => scenario.characters.order.indexOf(a) - scenario.characters.order.indexOf(b));
}).addFilter('is_str', (s) => (typeof s === 'string'))
  .addFilter('map', (arr, prop) => arr.map(item => lodash.get(item, prop))) // https://github.com/pdehaan/11ty-nunjucks-filter-map
  .addFilter('getitem_by_list', (obj, l) => l.map((i) => obj[i]));

export {texEnv};