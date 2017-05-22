-- a)  Print the brand group names with the highest number of Belgian indicia publishers.

SELECT BG.name, COUNT(*)
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
ORDER BY COUNT(*) DESC;


-- b)  Print the ids and names of publishers of Danish book series.

SELECT P.id, P.name
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

SELECT S.name
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

SELECT I.publication_date, COUNT(*)
FROM Issue I
WHERE I.publication_date >= 1990 AND I.publication_date <=2017
GROUP BY I.publication_date
ORDER BY I.publication_date ASC;


-- e) Print the number of series for each indicia publisher whose name resembles ‘DC comics’.

SELECT IP.name, COUNT(DISTINCT(I.series_id))
FROM Indicia_Publisher IP, Issue I
WHERE IP.id = I.indicia_publisher_id AND IP.name like '%dc comics%'
GROUP BY IP.id
ORDER BY COUNT(*) DESC;


-- f) Print the titles of the 10 most reprinted stories

SELECT S.title
FROM Story S
WHERE S.id IN (
	SELECT SR.origin_id
	FROM story_reprint SR
	GROUP BY SR.origin_id
	ORDER BY COUNT(*) DESC
) AND S.title <> 'NULL'
LIMIT 10;


-- g) Print the artists that have scripted, drawn, and colored at least one of the stories they were involved in.

SELECT A.name
FROM Artist A
WHERE A.id IN (
	SELECT DISTINCT S.artist_id
	FROM script S
) AND A.id IN (
	SELECT DISTINCT P.artist_id
	FROM pencils P
) AND A.id IN (
	SELECT DISTINCT C.artist_id
	FROM colors C
);


-- h)  Print all non-reprinted stories involving Batman as a non-featured character.

SELECT DISTINCT S.title
FROM Story S
WHERE S.feature<>'Batman' AND S.id IN (
	SELECT CS.story_id
	FROM Character_ C
	JOIN Characters CS ON (CS.character_id=C.id)
	WHERE C.name='Batman'
) AND S.id NOT IN (
	SELECT SR.origin_id
	FROM story_reprint SR
);

