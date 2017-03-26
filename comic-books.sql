CREATE TABLE Story_Type(
	story_type_id INTEGER,
	story_name CHAR(40),
	PRIMARY KEY(story_type_id)
);

CREATE TABLE Language(
	language_id INTEGER,
	code CHAR(3),
	language_name CHAR(27),
	PRIMARY KEY(language_id)
);

CREATE TABLE Series_Publication_Type(
	publication_type_id INTEGER,
	publication_type_name CHAR(8),
	PRIMARY KEY(publication_type_id)
);

-- contains relationship publ_country
CREATE TABLE Publisher(
	publisher_id INTEGER,
	publisher_name CHAR(124),
	country_id INTEGER NOT NULL,
	year_began INTEGER,
	year_ended INTEGER,
	notes CHAR(3201),
	url CHAR(130),
	PRIMARY KEY(publisher_id),
	FOREIGN KEY(country_id) REFERENCES Country
);

-- contains relationship bg_publisher
CREATE TABLE Brand_Group(
	brand_group_id INTEGER,
	year_began INTEGER,
	year_ended INTEGER,
	notes CHAR(729),
	url CHAR(152),
	publisher_id INTEGER NOT NULL,
	PRIMARY KEY(brand_group_id),
	FOREIGN KEY(publisher_id) REFERENCES Publisher
);

-- contains relationships ind_country and ip_publisher
CREATE TABLE Indicia_Publisher(
	indicia_publisher_id INTEGER,
	indicia_publisher_name CHAR(124),
	country_id INTEGER NOT NULL,
	publisher_id INTEGER NOT NULL,
	year_began INTEGER,
	year_ended INTEGER,
	is_surrogate BIT, -- 0 or 1 value
	notes CHAR(2593),
	url CHAR(115),
	PRIMARY KEY(indicia_publisher_id),
	FOREIGN KEY(country_id) REFERENCES Country,
	FOREIGN KEY(publisher_id) REFERENCES Publisher
);

CREATE TABLE Country(
	country_id INTEGER,
	country_code CHAR(4),
	country_name CHAR(36),
	PRIMARY KEY(country_id)
);

-- contains relationships story_target and story_origin
CREATE TABLE Story_Reprint(
	story_reprint_id INTEGER,
	origin_id INTEGER NOT NULL,
	target_id INTEGER NOT NULL,
	PRIMARY KEY(story_reprint_id),
	FOREIGN KEY(origin_id) REFERENCES Story(story_id),
	FOREIGN KEY (target_id) REFERENCES Story(story_id)
);

-- contains relationships issue_target and issue_origin
CREATE TABLE Issue_Reprint(
	issue_reprint_id INTEGER,
	origin_issue_id INTEGER NOT NULL,
	target_issue_id INTEGER NOT NULL,
	PRIMARY KEY(issue_reprint_id),
	FOREIGN KEY(origin_issue_id) REFERENCES Issue(issue_id),
	FOREIGN KEY(target_issue_id) REFERENCES Issue(issue_id)
);

-- contains relationships written_in, first_issue, last_issue, publ_type, country and published_by
CREATE TABLE Series(
	series_id INTEGER,
	series_name CHAR(239),
	format CHAR(200),
	year_began INTEGER,
	year_ended INTEGER,
	publication_dates DATE,
	first_issue_id INTEGER NOT NULL,
	last_issue_id INTEGER NOT NULL,
	publisher_id INTEGER NOT NULL,
	country_id INTEGER NOT NULL,
	language_id INTEGER NOT NULL,
	notes CHAR(3868),
	color CHAR(200),
	dimensions CHAR(709),
	paper_stock CHAR(140),
	binding CHAR(90),
	publishing_format CHAR(93),
	publication_type_id INTEGER,
	PRIMARY KEY(series_id),
	FOREIGN KEY(first_issue_id) REFERENCES Issue(issue_id),
	FOREIGN KEY(last_issue_id) REFERENCES Issue(issue_id),
	FOREIGN KEY(publisher_id) REFERENCES Publisher,
	FOREIGN KEY(country_id) REFERENCES Country,
	FOREIGN KEY(language_id) REFERENCES Language,
	FOREIGN KEY(publication_type_id) REFERENCES Series_Publication_Type
);

-- contains relationships series and indicia_publ
CREATE TABLE Issue(
	issue_id  INTEGER,
	issue_number INTEGER,
	series_id INTEGER NOT NULL,
	indicia_publisher_id INTEGER,
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
	PRIMARY KEY(issue_id),
	FOREIGN KEY(series_id) REFERENCES Series,
	FOREIGN KEY(indicia_publisher_id) REFERENCES Indicia_Publisher
);

-- contains relationships issue and story_type
CREATE TABLE Story(
	story_id INTEGER,
	story_title CHAR(19727),
	story_feature CHAR(423),
	issue_id INTEGER NOT NULL,
	script CHAR(1166),
	pencils CHAR(1702),
	inks CHAR(1610),
	colors CHAR(1468),
	letters CHAR(776),
	editing CHAR(347),
	genre CHAR(119),
	characters CHAR(3675),
	synopsis CHAR(17655),
	reprint_notes CHAR(3562),
	notes CHAR(11486),
	type_id INTEGER NOT NULL,
	PRIMARY KEY(story_id),
	FOREIGN KEY(issue_id) REFERENCES Issue,
	FOREIGN KEY(type_id) REFERENCES Story_Type(story_type_id)
);