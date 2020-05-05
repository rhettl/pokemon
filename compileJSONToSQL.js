const fs    = require('fs');
const db    = require('./compiled/pokemon');
const untab = require('unindent');

const escapeString = (str) => str ? '\'' + str.replace(/'/g, '\\\'').replace(/`/g, '\\`') + '\'' : 'null';
const orNull = (val) => val || null;
const numOrNull = (num) => typeof num === 'number' ? num : 'null';

const valsPerInsert = 50;

const tables = {
  pokemon:    {
    create:       untab(`
      create table pokemon.pokemon
      (
        number     int         not null primary key,
        name       varchar(64) not null,
        type1      varchar(16) not null,
        type2      varchar(16) null,
        stat_total int         not null,
        hp         int         not null,
        attack     int         not null,
        defense    int         not null,
        spAttack   int         not null,
        spDefense  int         not null,
        speed      int         not null
      );
    `),
    insertHeader: `INSERT INTO pokemon.pokemon (number, name, type1, type2, stat_total, hp, attack, defense, spAttack, spDefense, speed) VALUES`,
    valuesMap:    (d) => `(${d.number}, ${escapeString(d.name)}, ${escapeString(d.type1)}, ${escapeString(d.type2)}, ${numOrNull(d.total)}, ${numOrNull(d.hp)}, ${numOrNull(d.attack)}, ${numOrNull(d.defense)}, ${numOrNull(d.spAttack)}, ${numOrNull(d.spDefense)}, ${numOrNull(d.speed)})`

  },
  evolutions: {
    create:       untab(`
      create table pokemon.evolutions
      (
        evFrom      int         not null,
        evTo        int         not null,
        level       int         null,
        evCondition varchar(16) not null,
        type        varchar(16) not null,
        primary key (evFrom, evTo)
      );
    `),
    insertHeader: `INSERT INTO pokemon.evolutions (evFrom, evTo, level, evCondition, type) VALUES`,
    valuesMap:    (d) => `(${d.from}, ${d.to}, ${numOrNull(d.level)}, ${escapeString(d.condition)}, ${escapeString(d.type)})`

  },
  types:      {
    create:       untab(`
      create table pokemon.types
      (
        attack        varchar(16) not null,
        defence       varchar(16) not null,
        effectiveness varchar(64) not null,
        multiplier    double      null,
        primary key (attack, defend)
      );
    `),
    insertHeader: `INSERT INTO pokemon.types (attack, defence, effectiveness, multiplier) VALUES`,
    valuesMap:    (d) => `(${escapeString(d.attack)}, ${escapeString(d.defense)}, ${escapeString(d.effectiveness)}, ${d.multiplier})`

  },
  moves:      {
    create:       untab(`
      create table pokemon.moves
      (
        name             varchar(16) not null primary key,
        type             varchar(16) not null,
        category         varchar(16) not null,
        power            int         null,
        accuracy         int         null,
        pp               int         null,
        tm               int         null,
        effect           varchar(64) null,
        probability_perc int         null
      );
    `),
    insertHeader: `INSERT INTO pokemon.moves (name, type, category, power, accuracy, pp, tm, effect, probability_perc) VALUES`,
    valuesMap:    (d) => `(${escapeString(d.name)}, ${escapeString(d.type)}, ${escapeString(d.category)}, ${numOrNull(d.power)}, ${numOrNull(d.accuracy)}, ${numOrNull(d.pp)}, ${numOrNull(d.tm)}, ${escapeString(d.effect)}, ${numOrNull(d.probability_perc)})`

  }
};

let out = `
CREATE DATABASE pokemon IF NOT EXISTS;
USE pokemon;
`;

Object.getOwnPropertyNames(db).forEach(key => {

  const data = db[key];
  const table = tables[key];

  console.log(data[1]);

  const values = data.map(table.valuesMap);
  const valueSets = values.reduce((arr, next, i) => {
    const index = Math.floor(i / valsPerInsert);

    if (!arr[index]) {
      arr[index] = [];
    }

    arr[index].push(next);

    return arr;
  }, []);

  const insertStatements = valueSets.map(vArr => {
    return `${table.insertHeader} ${vArr.join(', ')};`;
  });

  out += table.create + '\n' + insertStatements.join('\n') + '\n';

});

// console.log(out);
fs.writeFileSync('./compiled/pokemon.sql', out);






























