import round from 'lodash/round';

export function transformise(string) {
  const str = string.toLowerCase()
   .replace(/[' ]/g, '_') // replace spaces & apostrophes with an underscore
   .replace(/[^a-z0-9_]/g, '') // remove anything that isn't alphanumeric or underscore
   .replace(/[_]+/g, '_'); // replace multiple _'s with a single _
  return str;
}

export function decodePlayer(p) {
  return {
    firstName: p.first_name,
    lastName: p.last_name,
    fullName: `${p.first_name} ${p.last_name}`,
    id: p.id,
    salary: p.salary,
  };
}

export function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * [dollarize description]
 * @param  {Int} cents
 * @param  {Int} place - The place to round to.
 * @return {String}
 */
export function dollarize(dollars, decimalPlaces = 0) {
  const value = round(dollars, decimalPlaces);
  return `$${numberWithCommas(value)}`;
}
