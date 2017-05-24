-- a)  Print the series names that have the highest number of issues which contain a story whose type (e.g.,cartoon) is not the one occurring most frequently in the database (e.g, illustration). 
-- [Fix order]

SELECT DISTINCT S.name
FROM Series S
JOIN (
	SELECT I.series_id
	FROM Issue I
	JOIN (
		SELECT DISTINCT St.issue_id
		FROM Story St
		WHERE St.type_id <> (
			SELECT St.type_id
			FROM Story St
			GROUP BY St.type_id
			ORDER BY COUNT(St.type_id) DESC
			LIMIT 1)) AS NEW_STORY
	ON I.id = NEW_STORY.issue_id) AS NEW_ISSUE
ON S.id = NEW_ISSUE.series_id
GROUP BY S.id
ORDER BY COUNT(*) DESC
LIMIT 15;


-- b)  Print the names of publishers who have series with all series types. 

SELECT P.name
FROM Publisher P
JOIN (
	SELECT PUBL_TYPE.publisher_id, COUNT(*) 
	FROM (
		SELECT S.publisher_id, PT.id
		FROM Series S, Series_Publication_Type PT
		WHERE S.publication_type_id = PT.id
		GROUP BY S.publisher_id , PT.id) AS PUBL_TYPE
	GROUP BY PUBL_TYPE.publisher_id
	HAVING COUNT(*) = (
		SELECT COUNT(PT.id) 
		FROM Series_Publication_Type PT)) AS PUBL
ON P.id = PUBL.publisher_id
ORDER BY P.name ASC;


-- c)  Print the 10 most-reprinted characters from Alan Moore's stories. 

SELECT C.name
FROM Character_ C
JOIN (
	SELECT c.character_id
	FROM characters c
	JOIN (
		SELECT s.story_id
		FROM script s
		JOIN (
			SELECT A.id
			FROM Artist A
			WHERE A.name = 'Alan Moore'
			LIMIT 1) AS A
		ON s.artist_id=A.id) AS AM_STORIES
	ON c.story_id=AM_STORIES.story_id
	GROUP BY c.character_id
	ORDER BY COUNT(c.story_id) DESC
	LIMIT 10) AS MOST_REPR_CHAR
ON C.id=MOST_REPR_CHAR.character_id;


-- d)  Print the writers of nature-related stories that have also done the pencilwork in all their nature-related stories. 

SELECT DISTINCT A.name
FROM Artist A
JOIN (
	SELECT SELECTED_STORIES.artist_id
	FROM (
		SELECT s.story_id, s.artist_id
		FROM script s
		JOIN (
			SELECT S.id
			FROM Story S
			WHERE S.genre LIKE '%nature%') AS S
		ON s.story_id = S.id) as SELECTED_STORIES
	JOIN pencils p ON SELECTED_STORIES.story_id = p.story_id
	WHERE SELECTED_STORIES.artist_id = p.artist_id) AS NATURE_ARTISTS
ON A.id = NATURE_ARTISTS.artist_id;


-- e)  For each of the top-10 publishers in terms of published series, print the 3 most popular languages of their series. 
-- [Select only 3 languages]

SELECT P.name AS publisher, PL2.name AS language
FROM Publisher P
JOIN (
	SELECT PL.publisher_id, L.name
	FROM Language L
	JOIN (
		SELECT S.publisher_id, S.language_id
		FROM Series S
		JOIN (
			SELECT S.publisher_id
			FROM Series S
			GROUP BY S.publisher_id
			ORDER BY COUNT(*) DESC
			LIMIT 10
		) AS TOP_10_PUBL
		ON S.publisher_id = TOP_10_PUBL.publisher_id
		GROUP BY S.publisher_id, S.language_id
	) AS PL
	ON L.id = PL.language_id
) AS PL2
ON P.id = PL2.publisher_id;


-- f)  Print the languages that have more than 10000 original stories published in magazines, along with the number of those stories. 

SELECT L.name as language, BY_LANGUAGE.number_of_stories
FROM Language L
JOIN (
	SELECT MAG_ISSUES.language_id, COUNT(*) AS number_of_stories
	FROM Story St
	JOIN (
		SELECT I.id AS issue_id, MAGAZINES.id AS series_id, MAGAZINES.language_id
		FROM Issue I
		JOIN (
			SELECT S.id, S.language_id
			FROM Series S
			JOIN Series_Publication_Type SPT 
			ON S.publication_type_id = SPT.id
			WHERE SPT.name = 'magazine') AS MAGAZINES
		ON I.series_id = MAGAZINES.id) AS MAG_ISSUES
	ON St.issue_id = MAG_ISSUES.issue_id
	GROUP BY MAG_ISSUES.language_id) AS BY_LANGUAGE
ON L.id = BY_LANGUAGE.language_id
ORDER BY BY_LANGUAGE.number_of_stories DESC;


-- g)  Print all story types that have not been published as a part of Italian magazine series. 
-- [remove IN??]

SELECT *
FROM Story_Type ST
WHERE ST.id NOT IN (
	SELECT DISTINCT St.type_id
	FROM Story St
	JOIN (
		SELECT I.id
		FROM Issue I
		JOIN (
			SELECT MAGAZINES.id
			FROM Country C
			JOIN (
				SELECT S.id, S.country_id
				FROM Series S
				JOIN Series_Publication_Type SPT ON S.publication_type_id = SPT.id
				WHERE SPT.name = 'magazine') AS MAGAZINES
			ON C.id=MAGAZINES.country_id
			WHERE C.name = 'Italy'
		) AS ITALIAN_MAGAZINES
		ON I.series_id = ITALIAN_MAGAZINES.id
	) AS IM_ISSUES
	ON St.issue_id = IM_ISSUES.id);


-- h)  Print the writers of cartoon stories who have worked as writers for more than one indicia publisher. 

SELECT A.name
FROM Artist A
JOIN (
	SELECT ARTIST_WITH_IP.artist_id
	FROM(
		SELECT s.artist_id, WITH_IP.indicia_publisher_id
		FROM script s
		JOIN (
			SELECT I.indicia_publisher_id, CARTOON_STORIES.id
			FROM Issue I
			JOIN (
				SELECT S.id, S.issue_id
				FROM Story S
				JOIN (
					SELECT ST.id
					FROM Story_Type ST
					WHERE ST.name = 'cartoon'
				) AS CARTOON_TYPE
				ON S.type_id = CARTOON_TYPE.id
			) AS CARTOON_STORIES
			ON I.id = CARTOON_STORIES.issue_id
		) AS WITH_IP
		ON s.story_id = WITH_IP.id
		GROUP BY s.artist_id, WITH_IP.indicia_publisher_id) AS ARTIST_WITH_IP
	GROUP BY ARTIST_WITH_IP.artist_id
	HAVING COUNT(*) > 1
) AS ARTIST_WITH_MORE_THAN_ONE_IP
ON A.id=ARTIST_WITH_MORE_THAN_ONE_IP.artist_id;


-- i)  Print the 10 brand groups with the highest number of indicia publishers. 

SELECT BG.name
FROM (
	SELECT BG.id, BG.name
	FROM Brand_Group BG
	JOIN Indicia_Publisher IP ON IP.publisher_id=BG.publisher_id
) AS BG
GROUP BY BG.id
ORDER BY COUNT(*) DESC
LIMIT 10;


-- j)  Print the average series length (in terms of years) per indicia publisher. 

SELECT IP.name AS indicia_publisher, IP_AVG.average_series_length
FROM Indicia_Publisher IP
JOIN (
	SELECT ISSUE_SERIES.indicia_publisher_id, AVG(ISSUE_SERIES.year_ended - ISSUE_SERIES.year_began) AS average_series_length
	FROM (
		SELECT S.id AS series_id, I.id AS issue_id, S.year_began, S.year_ended, I.indicia_publisher_id
		FROM Series S
		JOIN Issue I ON I.series_id = S.id) AS ISSUE_SERIES
	JOIN Indicia_Publisher IP ON IP.id = ISSUE_SERIES.indicia_publisher_id
	GROUP BY ISSUE_SERIES.indicia_publisher_id) AS IP_AVG
ON IP_AVG.indicia_publisher_id = IP.id;


-- k)  Print the top 10 indicia publishers that have published the most single-issue series. 

SELECT IP.name AS indicia_publisher
FROM Indicia_Publisher IP
JOIN (
	SELECT I.indicia_publisher_id
	FROM Issue I
	JOIN (
		SELECT I.series_id
		FROM Issue I
		GROUP BY I.series_id
		HAVING COUNT(*) = 1
	) AS SINGLE_ISSUES
	ON I.series_id = SINGLE_ISSUES.series_id
	WHERE I.indicia_publisher_id IS NOT NULL
	GROUP BY I.indicia_publisher_id
	ORDER BY COUNT(*) DESC
	LIMIT 10
) AS TOP_IPS
ON IP.id = TOP_IPS.indicia_publisher_id;


-- l)  Print the 10 indicia publishers with the highest number of script writers in a single story. 

SELECT IP.name AS indicia_publisher
FROM Indicia_Publisher IP
JOIN (
	SELECT DISTINCT I.indicia_publisher_id
	FROM Issue I
	JOIN (
		SELECT St.issue_id
		FROM Story St
		JOIN (
			SELECT s.story_id
			FROM script s
			GROUP BY s.story_id
			ORDER BY COUNT(*) DESC
		) AS STORIES
		ON St.id = STORIES.story_id
	) AS ISSUES
	ON I.id = ISSUES.issue_id
	WHERE I.indicia_publisher_id IS NOT NULL
	LIMIT 10) AS TOP_IPS
ON IP.id = TOP_IPS.indicia_publisher_id;


-- m)  Print all Marvel heroes that appear in Marvel-DC story crossovers. 

SELECT C.name as Marvel_heroes
FROM Character_ C
JOIN (
	SELECT DISTINCT c.character_id
	FROM characters c
	JOIN (
		SELECT St.id
		FROM Story St
		WHERE St.title LIKE '%Marvel%' AND St.title LIKE '%DC%'
	) AS CROSSOVERS
	ON c.story_id = CROSSOVERS.id
) AS CHARACTERS
ON C.id = CHARACTERS.character_id;


-- n)  Print the top 5 series with most issues 

SELECT S.id, S.name
FROM Series S
JOIN (
	SELECT I.series_id, COUNT(*)
	FROM Issue I
	GROUP BY I.series_id
	ORDER BY COUNT(*) DESC
	LIMIT 5
) AS SERIES
ON S.id = SERIES.series_id;


-- o)  Given an issue, print its most reprinted story.

SELECT MOST_REPR.issue_id, MAX(MOST_REPR.reprint_count)
FROM (
	SELECT DISTINCT St.issue_id, REPRINTS.reprint_count
	FROM Story St
	JOIN (
		SELECT sr.origin_id, COUNT(*) AS reprint_count
		FROM story_reprint sr
		GROUP BY sr.origin_id
		ORDER BY COUNT(*) DESC
	) AS REPRINTS
	ON St.id = REPRINTS.origin_id) AS MOST_REPR
group by MOST_REPR.issue_id;




