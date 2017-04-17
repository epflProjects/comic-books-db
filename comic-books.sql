-- ENTITIES

CREATE TABLE Story_Type(
	id INTEGER NOT NULL,
	name CHAR(40) NOT NULL, -- constraint assumption
	PRIMARY KEY(id)
);

CREATE TABLE Language(
	id INTEGER NOT NULL,
	code CHAR(3) NOT NULL, -- constraint assumption
	name CHAR(27) NOT NULL, -- constraint assumption
	PRIMARY KEY(id)
);

CREATE TABLE Series_Publication_Type(
	id INTEGER NOT NULL,
	name CHAR(8) NOT NULL, -- constraint assumption
	PRIMARY KEY(id)
);

-- contains relation publ_country
CREATE TABLE Publisher(
	id INTEGER NOT NULL,
	name CHAR(124) NOT NULL, -- constraint assumption
	country_id INTEGER NOT NULL, -- relation constraint (total participation)
	year_began INTEGER,
	year_ended INTEGER,
	notes CHAR(3201),
	url CHAR(130),
	PRIMARY KEY(id),
	FOREIGN KEY(country_id) REFERENCES Country(id)
);

-- contains relation bg_publisher
CREATE TABLE Brand_Group(
	id INTEGER NOT NULL,
	name CHAR(94) NOT NULL, -- constraint assumption
	year_began INTEGER,
	year_ended INTEGER,
	notes CHAR(729),
	url CHAR(152),
	publisher_id INTEGER NOT NULL, -- relation constraint (total participation)
	PRIMARY KEY(id),
	FOREIGN KEY(publisher_id) REFERENCES Publisher(id)
);

-- contains relations ind_country and ip_publisher
CREATE TABLE Indicia_Publisher(
	id INTEGER NOT NULL,
	name CHAR(124) NOT NULL, -- constraint assumption
	publisher_id INTEGER NOT NULL, -- relation constraint (total participation)
	country_id INTEGER NOT NULL, -- relation constraint (total participation)
	year_began INTEGER,
	year_ended INTEGER,
	is_surrogate BIT NOT NULL, -- constraint assumption -- 0 or 1 value
	notes CHAR(2593),
	url CHAR(115),
	PRIMARY KEY(id),
	FOREIGN KEY(country_id) REFERENCES Country(id),
	FOREIGN KEY(publisher_id) REFERENCES Publisher(id)
);

CREATE TABLE Country(
	id INTEGER NOT NULL,
	code CHAR(4) NOT NULL, -- constraint assumption
	name CHAR(36) NOT NULL, -- constraint assumption
	PRIMARY KEY(id)
);

-- contains relations story_target and story_origin
CREATE TABLE Story_Reprint(
	id INTEGER NOT NULL,
	origin_id INTEGER NOT NULL, -- relation constraint (total participation)
	target_id INTEGER NOT NULL, -- relation constraint (total participation)
	PRIMARY KEY(id),
	FOREIGN KEY(origin_id) REFERENCES Story(id),
	FOREIGN KEY (target_id) REFERENCES Story(id)
);

-- contains relations issue_target and issue_origin
CREATE TABLE Issue_Reprint(
	id INTEGER NOT NULL,
	origin_issue_id INTEGER NOT NULL, -- relation constraint (total participation)
	target_issue_id INTEGER NOT NULL, -- relation constraint (total participation)
	PRIMARY KEY(id),
	FOREIGN KEY(origin_issue_id) REFERENCES Issue(id),
	FOREIGN KEY(target_issue_id) REFERENCES Issue(id)
);

-- contains relations written_in, first_issue, last_issue, publ_type, country and published_by
CREATE TABLE Series(
	id INTEGER NOT NULL,
	name CHAR(239) NOT NULL, -- constraint assumption
	format CHAR(200),
	year_began INTEGER NOT NULL, -- constraint assumption
	year_ended INTEGER,
	publication_dates DATE,
	first_issue_id INTEGER NOT NULL, -- relation constraint (total participation)
	last_issue_id INTEGER NOT NULL, -- relation constraint (total participation)
	publisher_id INTEGER NOT NULL, -- relation constraint (total participation)
	country_id INTEGER NOT NULL, -- relation constraint (total participation)
	language_id INTEGER NOT NULL, -- relation constraint (total participation)
	notes CHAR(3868),
	color CHAR(200),
	dimensions CHAR(709),
	paper_stock CHAR(140),
	binding CHAR(90),
	publishing_format CHAR(93),
	publication_type_id INTEGER, -- relation constraint (partial participation)
	PRIMARY KEY(id),
	FOREIGN KEY(first_issue_id) REFERENCES Issue(id),
	FOREIGN KEY(last_issue_id) REFERENCES Issue(id),
	FOREIGN KEY(publisher_id) REFERENCES Publisher(id),
	FOREIGN KEY(country_id) REFERENCES Country(id),
	FOREIGN KEY(language_id) REFERENCES Language(id),
	FOREIGN KEY(publication_type_id) REFERENCES Series_Publication_Type(id)
);

-- contains relations series, indicia_publ and issue_reprint
CREATE TABLE Issue(
	id INTEGER NOT NULL,
	number INTEGER NOT NULL, -- constraint assumption
	series_id INTEGER NOT NULL, -- relation constraint (total participation)
	indicia_publisher_id INTEGER, -- relation constraint (partial participation)
	publication_date DATE,
	price CHAR(220),
	page_count INTEGER,
	indicia_frequency CHAR(134),
	editing CHAR(1523),
	notes CHAR(2897),
	isbn CHAR(32),
	valid_isbn CHAR(13),
	barcode CHAR(38),
	title CHAR(111),
	on_sale_date DATE,
	rating CHAR(118),
	reprint_origin_id INTEGER,
	PRIMARY KEY(id),
	FOREIGN KEY(series_id) REFERENCES Series(id),
	FOREIGN KEY(indicia_publisher_id) REFERENCES Indicia_Publisher(id),
	FOREIGN KEY(reprint_origin_id) REFERENCES Issue(id)
);

-- contains relations issue, story_type and story_reprint
CREATE TABLE Story(
	id INTEGER NOT NULL,
	title CHAR(19727),
	feature CHAR(423),
	issue_id INTEGER NOT NULL, -- relation constraint (total participation)
	letters CHAR(776),
	editing CHAR(347),
	genre CHAR(119),
	synopsis CHAR(17655),
	reprint_notes CHAR(3562),
	notes CHAR(11486),
	type_id INTEGER NOT NULL, -- relation constraint (total participation)
	reprint_origin_id INTEGER,
	PRIMARY KEY(id),
	FOREIGN KEY(issue_id) REFERENCES Issue(id),
	FOREIGN KEY(type_id) REFERENCES Story_Type(id),
	FOREIGN KEY(reprint_origin_id) REFERENCES Story_Type(id)
);

CREATE TABLE Artist(
	id INTEGER NOT NULL,
	name VARCHAR NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE Character(
	id INTEGER NOT NULL,
	name VARCHAR NOT NULL,
	PRIMARY KEY(id)
);

-- RELATIONS

-- represents relation script
CREATE TABLE Script(
	story_id INTEGER NOT NULL,
	artist_id INTEGER NOT NULL,
	PRIMARY KEY(story_id, artist_id),
	FOREIGN KEY(story_id) REFERENCES Story(id),
	FOREIGN KEY(artist_id) REFERENCES Artist(id)
);

-- represents relation pencils
CREATE TABLE Pencils(
	story_id INTEGER NOT NULL,
	artist_id INTEGER NOT NULL,
	PRIMARY KEY(story_id, artist_id),
	FOREIGN KEY(story_id) REFERENCES Story(id),
	FOREIGN KEY(artist_id) REFERENCES Artist(id)
);

-- represents relation inks
CREATE TABLE Inks(
	story_id INTEGER NOT NULL,
	artist_id INTEGER NOT NULL,
	PRIMARY KEY(story_id, artist_id),
	FOREIGN KEY(story_id) REFERENCES Story(id),
	FOREIGN KEY(artist_id) REFERENCES Artist(id)
);

-- represents relation colors
CREATE TABLE Colors(
	story_id INTEGER NOT NULL,
	artist_id INTEGER NOT NULL,
	PRIMARY KEY(story_id, artist_id),
	FOREIGN KEY(story_id) REFERENCES Story(id),
	FOREIGN KEY(artist_id) REFERENCES Artist(id)
);

-- represents relation characters
CREATE TABLE Characters(
	story_id INTEGER NOT NULL,
	character_id INTEGER NOT NULL,
	PRIMARY KEY(story_id, character_id),
	FOREIGN KEY(story_id) REFERENCES Story(id),
	FOREIGN KEY(character_id) REFERENCES Character(id)
);
