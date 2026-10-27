INSERT INTO content_entries (id, type, title, data_json, status, created_at, updated_at)
VALUES (
  'about-ui-demo-blog-medallion-warehouse',
  'blog',
  'DEMO — SAMPLE CONTENT: Building a Medallion Data Warehouse',
  '{"title":"DEMO — SAMPLE CONTENT: Building a Medallion Data Warehouse","summary":"A fictional walkthrough of raw, cleaned, and curated warehouse layers, created only to exercise the portfolio reading view.","body":"DEMO — SAMPLE CONTENT. This fictional article exists only to test the portfolio content card; it does not describe a personal project.\n\nA medallion-style warehouse can separate source-aligned raw data from cleaned, conformed models and curated business tables. In this example, raw order events are retained as received, a staging model standardizes timestamps and identifiers, and curated marts calculate daily sales by store and product.\n\nBefore using a model like this in production, a team would define source contracts, freshness expectations, replay behavior, data ownership, and metric definitions. Tests for unique order keys, non-null dates, and accepted statuses help catch problems before they reach a dashboard.","publicationDate":"","tags":["DEMO","Data Engineering","Warehousing","dbt"],"projectReferences":[],"imageUrl":"","links":[]}',
  'published',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
)
ON CONFLICT(id) DO UPDATE SET type = excluded.type, title = excluded.title, data_json = excluded.data_json, status = excluded.status, updated_at = excluded.updated_at;

INSERT INTO content_entries (id, type, title, data_json, status, created_at, updated_at)
VALUES (
  'about-ui-demo-blog-data-quality-dbt',
  'blog',
  'DEMO — SAMPLE CONTENT: Debugging Data Quality Issues with SQL and dbt',
  '{"title":"DEMO — SAMPLE CONTENT: Debugging Data Quality Issues with SQL and dbt","summary":"A fictional debugging note about tracing duplicate records and late-arriving data through a SQL and dbt pipeline.","body":"DEMO — SAMPLE CONTENT. This fictional debugging note is only for testing the portfolio detail view and is not a report of personal work.\n\nImagine a daily model suddenly reports more orders than its source. A useful first check compares source and model counts by ingestion date, then groups the source by its intended business key to find duplicate deliveries. A second check compares event time with load time to spot late-arriving records.\n\nIn dbt, a unique-key test and a not-null test can make the assumptions visible. If the source can resend events, the model should deduplicate deterministically using an update timestamp and a stable tie-breaker. A freshness check can then distinguish a quiet source from a delayed one.","publicationDate":"","tags":["DEMO","SQL","dbt","Data Quality"],"projectReferences":[],"imageUrl":"","links":[]}',
  'published',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
)
ON CONFLICT(id) DO UPDATE SET type = excluded.type, title = excluded.title, data_json = excluded.data_json, status = excluded.status, updated_at = excluded.updated_at;

INSERT INTO content_entries (id, type, title, data_json, status, created_at, updated_at)
VALUES (
  'about-ui-demo-paper-transformer-reading-note',
  'paper',
  'DEMO — SAMPLE CONTENT: Sample Reading Note — Transformer Architectures',
  '{"title":"DEMO — SAMPLE CONTENT: Sample Reading Note — Transformer Architectures","authors":"","publicationYear":"","publicationDate":"","source":"Sample reading note — no paper or publication is being cited","sourceUrl":"","summary":"DEMO — SAMPLE CONTENT. This is an invented reading-note exercise about transformer architectures, not a summary of a specific paper. It sketches questions a reader might ask about attention, positional information, model depth, and the trade-offs between sequence length and computation.","tags":["DEMO","Reading Note","Transformers","AI/ML"],"personalNotes":"Sample note only: compare how an architecture represents token relationships, how it handles longer inputs, and which compute costs matter for its intended use. No real authors, publication venue, date, DOI, or paper link are associated with this placeholder."}',
  'published',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
)
ON CONFLICT(id) DO UPDATE SET type = excluded.type, title = excluded.title, data_json = excluded.data_json, status = excluded.status, updated_at = excluded.updated_at;

INSERT INTO content_entries (id, type, title, data_json, status, created_at, updated_at)
VALUES (
  'about-ui-demo-paper-query-optimization-reading-note',
  'paper',
  'DEMO — SAMPLE CONTENT: Sample Reading Note — Data Systems and Query Optimization',
  '{"title":"DEMO — SAMPLE CONTENT: Sample Reading Note — Data Systems and Query Optimization","authors":"","publicationYear":"","publicationDate":"","source":"Sample reading note — no paper or publication is being cited","sourceUrl":"","summary":"DEMO — SAMPLE CONTENT. This fictional reading note is a general study prompt about data systems and query optimization, not a review of a particular publication. It considers how query plans, indexes, partitioning, and data layout can affect the work performed by a system.","tags":["DEMO","Reading Note","Data Systems","Query Optimization"],"personalNotes":"Sample note only: inspect an estimated plan, identify scans and joins that dominate cost, and ask whether statistics, filtering, or physical layout can reduce unnecessary work. No real authors, publication venue, date, DOI, or paper link are associated with this placeholder."}',
  'published',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
)
ON CONFLICT(id) DO UPDATE SET type = excluded.type, title = excluded.title, data_json = excluded.data_json, status = excluded.status, updated_at = excluded.updated_at;

INSERT INTO content_entries (id, type, title, data_json, status, created_at, updated_at)
VALUES (
  'about-ui-demo-certificate-placeholder-one',
  'certificate',
  'DEMO — SAMPLE CONTENT: Placeholder Certificate Record 1 — Not a Real Credential',
  '{"title":"DEMO — SAMPLE CONTENT: Placeholder Certificate Record 1 — Not a Real Credential","issuer":"No issuer — UI placeholder only","issueDate":"","credentialId":"","certificateUrl":"","imageUrl":"","verificationUrl":""}',
  'published',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
)
ON CONFLICT(id) DO UPDATE SET type = excluded.type, title = excluded.title, data_json = excluded.data_json, status = excluded.status, updated_at = excluded.updated_at;

INSERT INTO content_entries (id, type, title, data_json, status, created_at, updated_at)
VALUES (
  'about-ui-demo-certificate-placeholder-two',
  'certificate',
  'DEMO — SAMPLE CONTENT: Placeholder Certificate Record 2 — Not a Real Credential',
  '{"title":"DEMO — SAMPLE CONTENT: Placeholder Certificate Record 2 — Not a Real Credential","issuer":"No issuer — UI placeholder only","issueDate":"","credentialId":"","certificateUrl":"","imageUrl":"","verificationUrl":""}',
  'published',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
)
ON CONFLICT(id) DO UPDATE SET type = excluded.type, title = excluded.title, data_json = excluded.data_json, status = excluded.status, updated_at = excluded.updated_at;

INSERT INTO content_entries (id, type, title, data_json, status, created_at, updated_at)
VALUES (
  'about-ui-demo-project-retail-analytics',
  'demo',
  'DEMO — SAMPLE CONTENT: Illustrative Retail Analytics Dashboard',
  '{"title":"DEMO — SAMPLE CONTENT: Illustrative Retail Analytics Dashboard","description":"Illustrative demo project only. This fictional concept is not a claim that a dashboard was completed or deployed. It shows the kind of retail view a prototype could contain: sales trends, category mix, store comparisons, and filterable date ranges.","category":"Data Analytics","technologies":["DEMO","SQL","Dashboard UI"],"thumbnailUrl":"","screenshots":[],"githubUrl":"","liveDemoUrl":"","creationDate":""}',
  'published',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
)
ON CONFLICT(id) DO UPDATE SET type = excluded.type, title = excluded.title, data_json = excluded.data_json, status = excluded.status, updated_at = excluded.updated_at;

INSERT INTO content_entries (id, type, title, data_json, status, created_at, updated_at)
VALUES (
  'about-ui-demo-project-data-quality-pipeline',
  'demo',
  'DEMO — SAMPLE CONTENT: Illustrative Data Quality Monitoring Pipeline',
  '{"title":"DEMO — SAMPLE CONTENT: Illustrative Data Quality Monitoring Pipeline","description":"Illustrative demo project only. This fictional concept is not a claim that a pipeline was completed or deployed. It sketches scheduled checks for freshness, null rates, duplicate keys, and volume changes, with a compact status view for follow-up.","category":"Data Engineering","technologies":["DEMO","SQL","dbt","Python"],"thumbnailUrl":"","screenshots":[],"githubUrl":"","liveDemoUrl":"","creationDate":""}',
  'published',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
)
ON CONFLICT(id) DO UPDATE SET type = excluded.type, title = excluded.title, data_json = excluded.data_json, status = excluded.status, updated_at = excluded.updated_at;
