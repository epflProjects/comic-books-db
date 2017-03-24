CREATE TABLE Story_Time
(story_type_id INTEGER,
story_name CHAR(25),
PRIMARY KEY(story_type_id));

CREATE TABLE Language
(language_id INTEGER,
code CHAR(6),
language_name CHAR(25),
PRIMARY KEY(language_id));

CREATE TABLE Series_Publication_Type -- contains relationship publ_type
(publication_type_id INTEGER,
publication_type_name CHAR(8),
series_id INTEGER,
PRIMARY KEY(publication_type_id),
FOREIGN KEY(series_id) REFERENCES Series);

CREATE TABLE Publisher -- contains relationship publ_country
(publisher_id INTEGER,
publisher_name CHAR(50),
country_id INTEGER NOT NULL,
year_began INTEGER,
year_ended INTEGER,
notes CHAR(200),
url CHAR(20),
PRIMARY KEY(publisher_id),
FOREIGN KEY(country_id) REFERENCES Country);

CREATE TABLE Brand_Group -- contains relationship publisher
(brand_group_id INTEGER,
year_began INTEGER,
year_ended INTEGER,
notes CHAR(200),
url CHAR(20),
publisher_id INTEGER NOT NULL,
PRIMARY KEY(brand_group_id),
FOREIGN KEY(publisher_id) REFERENCES Publisher);

CREATE TABLE Indicia_Publisher -- contains relationship ind_country and publisher
(indicia_publisher_id INTEGER,
indicia_publisher_name CHAR(200),
country_id INTEGER NOT NULL,
publisher_id INTEGER NOT NULL,
year_began INTEGER,
year_ended INTEGER,
is_surrogate INTEGER(1), -- TODO 0 or 1 value
notes CHAR(200),
url CHAR(20),
PRIMARY KEY(indicia_publisher_id),
FOREIGN KEY(country_id) REFERENCES Country,
FOREIGN KEY(publisher_id) REFERENCES Publisher);

CREATE TABLE Country
(country_id INTEGER,
country_code CHAR(4),
country_name CHAR(30),
PRIMARY KEY(country_id));

CREATE TABLE Story_Reprint -- contains relationship story_target and story_origin
(story_reprint_id INTEGER,
origin_id INTEGER NOT NULL,
target_id INTEGER NOT NULL,
PRIMARY KEY(story_reprint_id),
FOREIGN KEY(origin_id) REFERENCES Story,
FOREIGN KEY (target_id) REFERENCES Sory);

CREATE TABLE Issue_Reprint -- contains relationship issue_target and issue_origin
(issue_reprint_id INTEGER,
origin_issue_id INTEGER NOT NULL,
target_issue_id INTEGER NOT NULL,
PRIMARY KEY(issue_reprint_id),
FOREIGN KEY(origin_issue_id) REFERENCES Issue,
FOREIGN KEY(target_issue_id) REFERENCES Issue);

CREATE TABLE Story
(story_id INTEGER,
story_title CHAR(50),
story_feature CHAR(25),
issue_id INTEGER NOT NULL,
script CHAR(25),
pencils INTEGER,
)