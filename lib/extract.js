import nunjucks from 'nunjucks';
import lodash from 'lodash';

// Pythonic naming sense

const reorderspeakers = (speakers_list, scenario) => {
	return speakers_list.toSorted((a, b) => scenario.characters.order.indexOf(a) - scenario.characters.order.indexOf(b));
}

const is_str = (s) => (typeof s === 'string');

// https://github.com/pdehaan/11ty-nunjucks-filter-map
const map = (arr, prop) => arr.map(item => lodash.get(item, prop));

const getitem_by_list = (obj, l) => l.map((i) => obj[i]);

export function getTexEnv(){
	return new nunjucks.Environment(new nunjucks.WebLoader('/views'), {
		autoescape: false,
		tags: {
			blockStart: '{&',
			blockEnd: '&}',
			variableStart: '{|',
			variableEnd: '|}'
		}
	}).addFilter('etex', (s) => {
		let result = '';
		if (s === undefined || s === null) {
			return '';
		}
		for (const c of s) {
			if (c == '\\') result += '\\textbackslash '
			else if (c == '~') result += '\\textasciitilde '
			else if (c == '{') result += '\\{'
			else if (c == '}') result += '\\}'
			else if (c == '&') result += '\\&'
			else if (c == ' ') result += '~'
			else if (c == '%') result += '\\%'
			else result += c
		}
		return result;
	})
	.addFilter('reorderspeakers', reorderspeakers).addFilter('is_str', is_str)
	.addFilter('map', map)
	.addFilter('getitem_by_list', getitem_by_list);
}

export function getGeneralEnv() {
	return new nunjucks.Environment(new nunjucks.WebLoader('/views'), {
		autoescape: false,
	})
		.addFilter('reorderspeakers', reorderspeakers).addFilter('is_str', is_str)
		.addFilter('map', map)
		.addFilter('getitem_by_list', getitem_by_list);
}
