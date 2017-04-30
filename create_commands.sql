-- ENTITIES

CREATE TABLE Story_Type(
	id INTEGER NOT NULL,
	name VARCHAR(239) NOT NULL, -- constraint assumption
	PRIMARY KEY(id)
);

CREATE TABLE Language(
	id INTEGER NOT NULL,
	code CHAR(4) NOT NULL, -- constraint assumption
	name VARCHAR(124) NOT NULL, -- constraint assumption
	PRIMARY KEY(id)
);

CREATE TABLE Series_Publication_Type(
	id INTEGER NOT NULL,
	name CHAR(8) NOT NULL, -- constraint assumption
	PRIMARY KEY(id)
);

CREATE TABLE Country(
	id INTEGER NOT NULL,
	code CHAR(4) NOT NULL, -- constraint assumption
	name VARCHAR(122) NOT NULL, -- constraint assumption
	PRIMARY KEY(id)
);

-- contains relation publ_country
CREATE TABLE Publisher(
	id INTEGER NOT NULL,
	name VARCHAR(124) NOT NULL, -- constraint assumption
	country_id INTEGER NOT NULL, -- relation constraint (total participation)
	year_began INTEGER,
	year_ended INTEGER,
	notes TEXT,
	url VARCHAR(152),
	PRIMARY KEY(id),
	FOREIGN KEY(country_id) REFERENCES Country(id)
);

-- contains relation bg_publisher
CREATE TABLE Brand_Group(
	id INTEGER NOT NULL,
	name VARCHAR(94) NOT NULL, -- constraint assumption
	year_began INTEGER,
	year_ended INTEGER,
	notes TEXT,
	url VARCHAR(152),
	publisher_id INTEGER NOT NULL, -- relation constraint (total participation)
	PRIMARY KEY(id),
	FOREIGN KEY(publisher_id) REFERENCES Publisher(id)
);

-- contains relations ind_country and ip_publisher
CREATE TABLE Indicia_Publisher(
	id INTEGER NOT NULL,
	name VARCHAR(124) NOT NULL, -- constraint assumption
	publisher_id INTEGER NOT NULL, -- relation constraint (total participation)
	country_id INTEGER NOT NULL, -- relation constraint (total participation)
	year_began INTEGER,
	year_ended INTEGER,
	is_surrogate BIT NOT NULL, -- constraint assumption -- 0 or 1 value
	notes TEXT,
	url VARCHAR(152),
	PRIMARY KEY(id),
	FOREIGN KEY(country_id) REFERENCES Country(id),
	FOREIGN KEY(publisher_id) REFERENCES Publisher(id)
);


-- contains relations written_in, first_issue, last_issue, publ_type, country and published_by
CREATE TABLE Series(
	id INTEGER NOT NULL,
	name VARCHAR(239) NOT NULL, -- constraint assumption
	format VARCHAR(200),
	year_began DATE NOT NULL, -- constraint assumption
	year_ended DATE,
	publication_dates VARCHAR(103),
	first_issue_id INTEGER NOT NULL, -- relation constraint (total participation)
	last_issue_id INTEGER NOT NULL, -- relation constraint (total participation)
	publisher_id INTEGER NOT NULL, -- relation constraint (total participation)
	country_id INTEGER NOT NULL, -- relation constraint (total participation)
	language_id INTEGER NOT NULL, -- relation constraint (total participation)
	notes TEXT,
	color VARCHAR(200),
	dimensions VARCHAR(709),
	paper_stock VARCHAR(140),
	binding VARCHAR(90),
	publishing_format VARCHAR(93),
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
	number VARCHAR(18),
	series_id INTEGER NOT NULL, -- relation constraint (total participation)
	indicia_publisher_id INTEGER, -- relation constraint (partial participation)
	publication_date DATE,
	price VARCHAR(58),
	page_count INTEGER,
	indicia_frequency VARCHAR(111),
	editing TEXT,
	notes TEXT,
	isbn VARCHAR(28),
	valid_isbn CHAR(13),
	barcode VARCHAR(18),
	title VARCHAR(67),
	on_sale_date DATE,
	rating VARCHAR(50),
	PRIMARY KEY(id),
	FOREIGN KEY(series_id) REFERENCES Series(id),
	FOREIGN KEY(indicia_publisher_id) REFERENCES Indicia_Publisher(id)
);

-- contains relations issue, story_type and story_reprint
CREATE TABLE Story(
	id INTEGER NOT NULL,
	title VARCHAR(4802),
	feature VARCHAR(211),
	issue_id INTEGER NOT NULL, -- relation constraint (total participation)
	letters VARCHAR(49),
	editing VARCHAR(664),
	genre VARCHAR(57),
	synopsis TEXT,
	reprint_notes TEXT,
	notes TEXT,
	type_id INTEGER NOT NULL, -- relation constraint (total participation)
	PRIMARY KEY(id),
	FOREIGN KEY(issue_id) REFERENCES Issue(id),
	FOREIGN KEY(type_id) REFERENCES Story_Type(id),
);

CREATE TABLE Artist(
	id INTEGER NOT NULL,
	name VARCHAR(37) NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE Character_(
	id INTEGER NOT NULL,
	name VARCHAR(122) NOT NULL,
	PRIMARY KEY(id)
);

-- RELATIONS

-- represents relation script
CREATE TABLE script(
	story_id INTEGER NOT NULL,
	artist_id INTEGER NOT NULL,
	PRIMARY KEY(story_id, artist_id),
	FOREIGN KEY(story_id) REFERENCES Story(id),
	FOREIGN KEY(artist_id) REFERENCES Artist(id)
);

-- represents relation pencils
CREATE TABLE pencils(
	story_id INTEGER NOT NULL,
	artist_id INTEGER NOT NULL,
	PRIMARY KEY(story_id, artist_id),
	FOREIGN KEY(story_id) REFERENCES Story(id),
	FOREIGN KEY(artist_id) REFERENCES Artist(id)
);

-- represents relation inks
CREATE TABLE inks(
	story_id INTEGER NOT NULL,
	artist_id INTEGER NOT NULL,
	PRIMARY KEY(story_id, artist_id),
	FOREIGN KEY(story_id) REFERENCES Story(id),
	FOREIGN KEY(artist_id) REFERENCES Artist(id)
);

-- represents relation colors
CREATE TABLE colors(
	story_id INTEGER NOT NULL,
	artist_id INTEGER NOT NULL,
	PRIMARY KEY(story_id, artist_id),
	FOREIGN KEY(story_id) REFERENCES Story(id),
	FOREIGN KEY(artist_id) REFERENCES Artist(id)
);

-- represents relation characters
CREATE TABLE characters(
	story_id INTEGER NOT NULL,
	character_id INTEGER NOT NULL,
	PRIMARY KEY(story_id, character_id),
	FOREIGN KEY(story_id) REFERENCES Story(id),
	FOREIGN KEY(character_id) REFERENCES Character_(id)
);

-- represents relation issue_reprint
CREATE TABLE issue_reprint(
	id INTEGER NOT NULL,
	origin_issue_id INTEGER NOT NULL, -- relation constraint (total participation)
	target_issue_id INTEGER NOT NULL, -- relation constraint (total participation)
	PRIMARY KEY(id),
	FOREIGN KEY(origin_issue_id) REFERENCES Issue(id),
	FOREIGN KEY(target_issue_id) REFERENCES Issue(id)
);

-- represents relation story_reprint
CREATE TABLE story_reprint(
	id INTEGER NOT NULL,
	origin_id INTEGER NOT NULL, -- relation constraint (total participation)
	target_id INTEGER NOT NULL, -- relation constraint (total participation)
	PRIMARY KEY(id),
	FOREIGN KEY(origin_id) REFERENCES Story(id),
	FOREIGN KEY(target_id) REFERENCES Story(id)
);