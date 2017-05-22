-- a)  Print the series names that have the highest number of issues which contain a story whose type (e.g.,cartoon) is not the one occurring most frequently in the database (e.g, illustration). 

SELECT DISTINCT Series.name
FROM Series
JOIN (
	SELECT I.series_id
	FROM Issue I
	JOIN (
		SELECT S.issue_id AS issue_id
		FROM Story S
		WHERE S.type_id <> (
			SELECT S.type_id
			FROM Story S
			GROUP BY S.type_id
			ORDER BY COUNT(S.type_id) DESC
			LIMIT 1)) AS NEW_STORY
	ON I.id = NEW_STORY.issue_id) AS NEW_ISSUE
ON Series.id = NEW_ISSUE.series_id;


-- b)  Print the names of publishers who have series with all series types. 
-- [Fix + optimize]



CREATE TABLE tmp 
SELECT P.id, S.publication_type_id
FROM Publisher P
JOIN Series S ON P.id = S.publisher_id
WHERE S.publication_type_id IS NOT NULL;


SELECT P.name
FROM Publisher P
JOIN (
	SELECT DISTINCT Publisher.id 
	FROM (Publisher LEFT OUTER JOIN (
		SELECT DISTINCT CROSS_PRODUCT.P_id
		FROM ((
			SELECT PSJ.id as P_id, PT.id as PT_id
			FROM tmp PSJ, Series_Publication_Type PT) AS CROSS_PRODUCT
			LEFT OUTER JOIN tmp PSJ 
			ON CROSS_PRODUCT.P_id=PSJ.id and CROSS_PRODUCT.PT_id = PSJ.publication_type_id)
		WHERE PSJ.id IS NULL
	) AS B
	ON Publisher.id=B.P_id) 
	WHERE B.P_id IS NULL
) AS DISQUALIFIED_VALUES
ON P.id=DISQUALIFIED_VALUES.P_id;

DROP TABLE tmp;


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
ON C.id=MOST_REPR_CHAR.character_id


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
			WHERE S.genre like '%nature%') AS S
		ON s.story_id=S.id) as SELECTED_STORIES
	JOIN pencils p ON SELECTED_STORIES.story_id = p.story_id
	WHERE SELECTED_STORIES.artist_id = p.artist_id) AS NATURE_ARTISTS
ON A.id=NATURE_ARTISTS.artist_id


-- e)  For each of the top-10 publishers in terms of published series, print the 3 most popular languages of their series. 
-- [Select only 3 languages]

SELECT P.name, PL2.name
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
		ON S.publisher_id=TOP_10_PUBL.publisher_id
		GROUP BY S.publisher_id, S.language_id
	) AS PL
	ON L.id=PL.language_id
) AS PL2
ON P.id=PL2.publisher_id

-- f)  Print the languages that have more than 10000 original stories published in magazines, along with the number of those stories. 



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
				JOIN Series_Publication_Type SPT ON S.publication_type_id=SPT.id
				WHERE SPT.name = 'magazine') AS MAGAZINES
			ON C.id=MAGAZINES.country_id
			WHERE C.name = 'Italy'
		) AS ITALIAN_MAGAZINES
		ON I.series_id=ITALIAN_MAGAZINES.id
	) AS IM_ISSUES
	ON St.issue_id=IM_ISSUES.id)


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
ON A.id=ARTIST_WITH_MORE_THAN_ONE_IP.artist_id


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



-- k)  Print the top 10 indicia publishers that have published the most single-issue series. 



-- l)  Print the 10 indicia publishers with the highest number of script writers in a single story. 



-- m)  Print all Marvel heroes that appear in Marvel-DC story crossovers (both marvel AND dc in the title). 



-- n)  Print the top 5 series with most issues 



-- o)  Given an issue, print its most reprinted story.
