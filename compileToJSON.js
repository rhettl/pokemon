const parse = require('csv-parse/lib/sync');
const fs    = require('fs');

const options = { columns: true, skip_empty_lines: true, cast: true, from_line: 2 };
const pokemon = {
  pokemon:    parse(fs.readFileSync('./source/pokemon-pokedex.csv'), {
    ...options, columns: [
      'number',
      'name',
      'type',
      'total',
      'hp',
      'attack',
      'defense',
      'spAttack',
      'spDefense',
      'speed'
    ]
  }),
  evolutions: parse(fs.readFileSync('./source/pokemon-evolutions.csv'), {
    ...options, columns: [
      'from',
      'to',
      'level',
      'condition',
      'type'
    ]
  }),
  types:      parse(fs.readFileSync('./source/pokemon-types.csv'), {
    ...options, columns: [
      'attack',
      'defense',
      'effectiveness',
      'multiplier'
    ]
  }),
  moves:      parse(fs.readFileSync('./source/pokemon-moves.csv'), {
    ...options, columns: [
      'name',
      'type',
      'category',
      'power',
      'accuracy',
      'pp',
      'tm',
      'effect',
      'probability_perc',
    ]
  }).slice(),
};


pokemon.pokemon = pokemon.pokemon
  .filter(p => p.number == parseInt(p.number))
  .map(p => {
    const type1 = p.type;
    delete p.type;
    return { ...p, type1, type2: null };
  })
  .map(p => {
    p.name = p.name.replace(/-[\w\s]+ (Forme?|Size|Mode|Cloak)$/, '')
    return p;
  })
  .reduce((obj, next) => {
    if (obj[next.number]) {
      obj[next.number].type2 = next.type1;
    } else {
      obj[next.number] = next;
    }
    return obj;
  }, {});
pokemon.pokemon = Object.getOwnPropertyNames(pokemon.pokemon)
  .map(key => pokemon.pokemon[key])

const reverse = pokemon.pokemon.reduce((obj, next) => {
  obj[next.name] = next.number;
  return obj;
}, {})

pokemon.evolutions = pokemon.evolutions
  .filter(p => p.from && reverse[p.from])
  .map(p => {

    p.fromName = p.from;
    p.toName   = p.to;

    p.from     = reverse[p.fromName];
    p.to       = reverse[p.toName];

    if (!p.from || !p.to) {
      console.error(`Error: Missing ${p.fromName} (${p.from}) to ${p.toName} (${p.to})`)
    }

    return p;
  })
;

fs.writeFileSync('./compiled/pokemon.json', JSON.stringify(pokemon, null, 2));
