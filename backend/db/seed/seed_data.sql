-- === Clear existing data ===
DELETE FROM workflow_edge;
DELETE FROM workflow_node_ui;
DELETE FROM workflow_node;
DELETE FROM workflow;

-- === Workflow 1 ===
INSERT INTO workflow (id, user_id, name, description, created_at, updated_at)
VALUES (
  1,
  'user_' || abs(random() % 10000),
  'Workflow #' || abs(random() % 10000),
  'Hardcoded workflow 1',
  strftime('%s','now') * 1000,
  strftime('%s','now') * 1000
);

INSERT INTO workflow_node (id, workflow_id, action_type, config)
VALUES (
  1,
  1,
  'time_trigger',
  '{"type":"time_trigger","interval":"' ||
    (SELECT v FROM (SELECT 'daily' AS v UNION SELECT 'weekly' UNION SELECT 'monthly') ORDER BY random() LIMIT 1) ||
    '","trigger_at":"' ||
    (SELECT t FROM (SELECT '08:00' AS t UNION SELECT '09:30' UNION SELECT '10:15' UNION SELECT '07:45') ORDER BY random() LIMIT 1) ||
    '"}'
);

INSERT INTO workflow_node_ui (id, x_position, y_position, node_label, node_type)
VALUES (
  1,
  abs(random() % 70) + 80,
  abs(random() % 100) + 150,
  'Trigger',
  'trigger'
);

INSERT INTO workflow_node (id, workflow_id, action_type, config)
VALUES (
  2,
  1,
  'send_email',
  '{"type":"send_email","to":"test' || abs(random() % 10000) || '@example.com","subject":"Hello #' || abs(random() % 10000) || '","body":"This is a seeded email for workflow 1."}'
);

INSERT INTO workflow_node_ui (id, x_position, y_position, node_label, node_type)
VALUES (
  2,
  abs(random() % 200) + 300,
  abs(random() % 100) + 150,
  'Send Email',
  'action'
);

INSERT INTO workflow_edge (workflow_id, source_node_id, target_node_id)
VALUES (1, 1, 2);

-- === Workflow 2 ===
INSERT INTO workflow (id, user_id, name, description, created_at, updated_at)
VALUES (
  2,
  'user_' || abs(random() % 10000),
  'Workflow #' || abs(random() % 10000),
  'Hardcoded workflow 2',
  strftime('%s','now') * 1000,
  strftime('%s','now') * 1000
);

INSERT INTO workflow_node (id, workflow_id, action_type, config)
VALUES (
  3,
  2,
  'time_trigger',
  '{"type":"time_trigger","interval":"' ||
    (SELECT v FROM (SELECT 'daily' AS v UNION SELECT 'weekly' UNION SELECT 'monthly') ORDER BY random() LIMIT 1) ||
    '","trigger_at":"' ||
    (SELECT t FROM (SELECT '08:00' AS t UNION SELECT '09:30' UNION SELECT '10:15' UNION SELECT '07:45') ORDER BY random() LIMIT 1) ||
    '"}'
);

INSERT INTO workflow_node_ui (id, x_position, y_position, node_label, node_type)
VALUES (
  3,
  abs(random() % 70) + 80,
  abs(random() % 100) + 150,
  'Trigger',
  'trigger'
);

INSERT INTO workflow_node (id, workflow_id, action_type, config)
VALUES (
  4,
  2,
  'send_email',
  '{"type":"send_email","to":"test' || abs(random() % 10000) || '@example.com","subject":"Hello #' || abs(random() % 10000) || '","body":"This is a seeded email for workflow 2."}'
);

INSERT INTO workflow_node_ui (id, x_position, y_position, node_label, node_type)
VALUES (
  4,
  abs(random() % 200) + 300,
  abs(random() % 100) + 150,
  'Send Email',
  'action'
);

INSERT INTO workflow_edge (workflow_id, source_node_id, target_node_id)
VALUES (2, 3, 4);

-- === Workflow 3 ===
INSERT INTO workflow (id, user_id, name, description, created_at, updated_at)
VALUES (
  3,
  'user_' || abs(random() % 10000),
  'Workflow #' || abs(random() % 10000),
  'Hardcoded workflow 3',
  strftime('%s','now') * 1000,
  strftime('%s','now') * 1000
);

INSERT INTO workflow_node (id, workflow_id, action_type, config)
VALUES (
  5,
  3,
  'time_trigger',
  '{"type":"time_trigger","interval":"' ||
    (SELECT v FROM (SELECT 'daily' AS v UNION SELECT 'weekly' UNION SELECT 'monthly') ORDER BY random() LIMIT 1) ||
    '","trigger_at":"' ||
    (SELECT t FROM (SELECT '08:00' AS t UNION SELECT '09:30' UNION SELECT '10:15' UNION SELECT '07:45') ORDER BY random() LIMIT 1) ||
    '"}'
);

INSERT INTO workflow_node_ui (id, x_position, y_position, node_label, node_type)
VALUES (
  5,
  abs(random() % 70) + 80,
  abs(random() % 100) + 150,
  'Trigger',
  'trigger'
);

INSERT INTO workflow_node (id, workflow_id, action_type, config)
VALUES (
  6,
  3,
  'send_email',
  '{"type":"send_email","to":"test' || abs(random() % 10000) || '@example.com","subject":"Hello #' || abs(random() % 10000) || '","body":"This is a seeded email for workflow 3."}'
);

INSERT INTO workflow_node_ui (id, x_position, y_position, node_label, node_type)
VALUES (
  6,
  abs(random() % 200) + 300,
  abs(random() % 100) + 150,
  'Send Email',
  'action'
);

INSERT INTO workflow_edge (workflow_id, source_node_id, target_node_id)
VALUES (3, 5, 6);

-- === Workflow 4 ===
INSERT INTO workflow (id, user_id, name, description, created_at, updated_at)
VALUES (
  4,
  'user_' || abs(random() % 10000),
  'Workflow #' || abs(random() % 10000),
  'Hardcoded workflow 4',
  strftime('%s','now') * 1000,
  strftime('%s','now') * 1000
);

INSERT INTO workflow_node (id, workflow_id, action_type, config)
VALUES (
  7,
  4,
  'time_trigger',
  '{"type":"time_trigger","interval":"' ||
    (SELECT v FROM (SELECT 'daily' AS v UNION SELECT 'weekly' UNION SELECT 'monthly') ORDER BY random() LIMIT 1) ||
    '","trigger_at":"' ||
    (SELECT t FROM (SELECT '08:00' AS t UNION SELECT '09:30' UNION SELECT '10:15' UNION SELECT '07:45') ORDER BY random() LIMIT 1) ||
    '"}'
);

INSERT INTO workflow_node_ui (id, x_position, y_position, node_label, node_type)
VALUES (
  7,
  abs(random() % 70) + 80,
  abs(random() % 100) + 150,
  'Trigger',
  'trigger'
);

INSERT INTO workflow_node (id, workflow_id, action_type, config)
VALUES (
  8,
  4,
  'send_email',
  '{"type":"send_email","to":"test' || abs(random() % 10000) || '@example.com","subject":"Hello #' || abs(random() % 10000) || '","body":"This is a seeded email for workflow 4."}'
);

INSERT INTO workflow_node_ui (id, x_position, y_position, node_label, node_type)
VALUES (
  8,
  abs(random() % 200) + 300,
  abs(random() % 100) + 150,
  'Send Email',
  'action'
);

INSERT INTO workflow_edge (workflow_id, source_node_id, target_node_id)
VALUES (4, 7, 8);
