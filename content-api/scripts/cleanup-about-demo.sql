DELETE FROM content_entries
WHERE id IN (
  'about-ui-demo-blog-medallion-warehouse',
  'about-ui-demo-blog-data-quality-dbt',
  'about-ui-demo-paper-transformer-reading-note',
  'about-ui-demo-paper-query-optimization-reading-note',
  'about-ui-demo-certificate-placeholder-one',
  'about-ui-demo-certificate-placeholder-two',
  'about-ui-demo-project-retail-analytics',
  'about-ui-demo-project-data-quality-pipeline'
)
AND title LIKE 'DEMO — SAMPLE CONTENT:%';
