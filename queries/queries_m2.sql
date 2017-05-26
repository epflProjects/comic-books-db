-- a)  Print the brand group names with the highest number of Belgian indicia publishers.
-- 1.7ms

SELECT BG.name AS brand_groups
FROM (
	SELECT BG.id, BG.name
	FROM Brand_Group BG
	JOIN Indicia_Publisher IP ON IP.publisher_id=BG.publisher_id
	WHERE IP.country_id IN (
		SELECT C.id
		FROM Country C
		WHERE C.name = 'Belgium'
	)
) AS BG
GROUP BY BG.id
ORDER BY COUNT(*) DESC
LIMIT 15;


-- b)  Print the ids and names of publishers of Danish book series.
-- 12.9ms

SELECT P.id AS publisher_id, P.name AS publisher_name
FROM Publisher P
WHERE P.id IN (
	SELECT S.publisher_id
	FROM Series S
	WHERE S.country_id IN (
		SELECT C.id
		FROM Country C
		WHERE C.name = 'Denmark'
	) AND S.publication_type_id IN (
		SELECT SPT.id
		FROM Series_Publication_Type SPT
		WHERE SPT.name = 'book'
	)
);


-- c)  Print the names of all Swiss series that have been published in magazines.
-- 2.6ms

SELECT S.name AS magazines_swiss_series_names
FROM Series S
WHERE S.country_id IN (
	SELECT C.id
	FROM Country C
	WHERE C.name = 'Switzerland'
) AND S.publication_type_id IN (
	SELECT PT.id
	FROM Series_Publication_Type PT
	WHERE PT.name = 'magazine'
);


-- d)  Starting from 1990, print the number of issues published each year.
-- 496ms

SELECT I.publication_date AS year, COUNT(*) AS number_of_issues
FROM Issue I
WHERE I.publication_date >= 1990 AND I.publication_date <=2017
GROUP BY I.publication_date;

-- e) Print the number of series for each indicia publisher whose name resembles ‘DC comics’.
-- 258ms

SELECT IP.name AS indicia_publisher, COUNT(DISTINCT(I.series_id)) AS number_of_series
FROM Indicia_Publisher IP, Issue I
WHERE IP.id = I.indicia_publisher_id AND IP.name LIKE '%dc comics%'
GROUP BY IP.id
ORDER BY COUNT(*) DESC;


-- f) Print the titles of the 10 most reprinted stories
-- 252ms

SELECT DISTINCT S.title AS most_reprinted_stories
FROM Story S
JOIN (
	SELECT SR.origin_id
	FROM story_reprint SR
	GROUP BY SR.origin_id
	ORDER BY COUNT(*) DESC
) AS SR
ON S.id = SR.origin_id
WHERE S.title <> 'NULL'
LIMIT 10;


-- g) Print the artists that have scripted, drawn, and colored at least one of the stories they were involved in.
-- 1.42s

SELECT DISTINCT A.name AS artists
FROM Artist A, script S, pencils P, colors C
WHERE S.story_id = P.story_id AND P.story_id = C.story_id 
AND A.id = S.artist_id AND A.id = P.artist_id AND A.id = C.artist_id;


-- h)  Print all non-reprinted stories involving Batman as a non-featured character.
-- 656 ms

SELECT DISTINCT S.title AS stories
FROM Story S
WHERE S.feature NOT LIKE '%Batman%' AND S.id IN (
	SELECT CS.story_id
	FROM Character_ C, Characters CS
	WHERE CS.character_id=C.id AND C.name='Batman'
) AND S.id NOT IN (
	SELECT SR.target_id
	FROM story_reprint SR
) AND S.title <> 'NULL';

