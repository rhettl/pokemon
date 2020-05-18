create table pokemon.my_pokemon
(
	id int auto_increment,
	owner int default null null,
	pokemon int not null,
	name varchar(64) not null,
	move_1 int default null null,
	move_2 int default null null,
	move_3 int default null null,
	move_4 int default null null,
	constraint my_pokemon_pk
		primary key (id)
);

