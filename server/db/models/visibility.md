# Entities for Visibility


webpages
------
id (uuid) (primary key)
protocol (str)
host (str)
port (str)


scapes
-----
id (uuid) (primary key)
webpage_id (uuid) (foriegn key `webpage.id`)
image (blob)
headers (jsonb)
status_code (int)
created_at (timestamp)


Getting Latest Images

```sql
SELECT
  *
FROM
  webpages
LEFT JOIN (
  SELECT
    *
  FROM
    scrapes
  WHERE
    scrapes.webpage_id = webpages.id
  ORDER BY created_at DESC
  LIMIT 1
) as s ON s.webpage_id = webpages.id;
```
