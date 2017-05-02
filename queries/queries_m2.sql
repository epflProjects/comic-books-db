-- a)  Print the brand group names with the highest number of Belgian indicia publishers.

SELECT BG.name
FROM Brand_Group BG
WHERE BG.publisher_id IN (
	SELECT P.id
	FROM Publisher P
	JOIN Indicia_Publisher IP ON IP.publisher_id=P.id
	WHERE IP.id IN (
		SELECT IP.id
		FROM Indicia_Publisher IP
		WHERE IP.country_id IN (
			SELECT C.id
			FROM Country C
			WHERE C.name = 'Belgium'
		)
	)
);


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
GROUP BY I.publication_date
HAVING I.publication_date >= 1990;


-- e) Print the number of series for each indicia publisher whose name resembles ‘DC comics’.

SELECT IP.name
FROM Indicia_Publisher IP
JOIN Publisher P ON IP.publisher_id = P.id
WHERE IP.name like '%dc comics%' AND IP.id IN (
	SELECT S.publisher_id
	FROM Series S
	GROUP BY S.publisher_id
	ORDER BY COUNT(*)
);


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

