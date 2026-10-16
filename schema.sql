-- BernOS Database Schema for Cloudflare D1
-- Initial schema definition and seed data

CREATE TABLE IF NOT EXISTS github_repos (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  language TEXT,
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  url TEXT,
  homepage TEXT,
  topics TEXT,
  updated_at TEXT,
  created_at TEXT,
  cached_at INTEGER
);

CREATE TABLE IF NOT EXISTS favorites (
  repo_id INTEGER PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS repo_categories (
  repo_id INTEGER PRIMARY KEY,
  folder TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS terraform_resources (
  id INTEGER PRIMARY KEY,
  service_name TEXT UNIQUE NOT NULL,
  resource_key TEXT,
  aws_category TEXT,
  icon_color TEXT,
  is_pro INTEGER DEFAULT 0,
  curiosity_title TEXT,
  curiosity_content TEXT,
  display_order INTEGER,
  column_position INTEGER
);

-- Seed LocalStack / AWS Terraform Resources
INSERT OR REPLACE INTO terraform_resources (id, service_name, resource_key, aws_category, icon_color, is_pro, curiosity_title, curiosity_content, display_order, column_position) VALUES
  (1, 'AppSync', '', 'App Integration', 'pink', 1, '', '', 1, 1),
  (2, 'API Gateway', 'aws_api_gateway.api', 'App Integration', 'pink', 0, 'Como entro em um novo time', 'Eu sou uma pessoa introvertida, então demoro um pouco para me adaptar ao ambiente. Mas na maioria das vezes sou a pessoa que escuta, entende e vou conhecendo cada um e interagindo com cada um.', 2, 1),
  (3, 'SQS', 'aws_sqs_queue.curiosidades', 'App Integration', 'pink', 0, 'Fatos aleatórios', 'Sou viciado em ler, minha média de livros costuma ser algo em torno de 30 livros por anos e mais de 15 mil páginas (Uso o Skoob para acompanhar)', 3, 1),
  (4, 'SNS', '', 'App Integration', 'pink', 0, '', '', 4, 1),
  (5, 'Step Functions', '', 'App Integration', 'pink', 0, '', '', 5, 1),
  (6, 'EventBridge', 'aws_eventbridge.events', 'App Integration', 'pink', 0, 'O que me fez virar DevOps', 'Minha curiosidade sempre me moveu para frente, logo quando comecei o curso técnico, conheci a dita palavra ''Cultura DevOps'', uma profissão que une a codificação com a infraestrutura e eu que havia começado a mexer com AWS achei um máximo, dito e feito, minha primeira experiência profissional acabou sendo DevOps e desde então estou por aí kkkkk.', 6, 1),
  (7, 'EC2', 'aws_ec2_instance.sonhos', 'Compute', 'orange', 0, 'Onde quero chegar', 'Atualmente minha maior meta pessoal é comprar minha casa e/ou AP e profissional, diria que é não parar de ter a curiosidade que tenho, para conseguir me adaptar com a área de T.I.', 7, 1),
  (8, 'Lambda', 'aws_lambda_function.hobbies', 'Compute', 'orange', 0, 'Fora do terminal', 'Fora do terminal: jogo xadrez (Elo ~1200 no Chess.com), jogo basquete, e tento aprender coisas novas, como tocar teclado, violão e por ai vai.', 8, 1),
  (9, 'ECS', '', 'Compute', 'orange', 1, '', '', 9, 1),
  (10, 'ECR', '', 'Compute', 'orange', 1, '', '', 10, 1),

  (11, 'CloudFormation', '', 'Management / Governance', 'pink', 0, '', '', 1, 2),
  (12, 'CloudWatch Logs', '', 'Management / Governance', 'pink', 0, '', '', 2, 2),
  (13, 'CloudWatch', '', 'Management / Governance', 'pink', 0, '', '', 3, 2),
  (14, 'Systems Manager', '', 'Management / Governance', 'pink', 0, '', '', 4, 2),
  (15, 'CloudTrail', '', 'Management / Governance', 'pink', 1, '', '', 5, 2),
  (16, 'SES', 'aws_ses_email.sender', 'Business Applications', 'pink', 0, 'Primeiro emprego em tech', 'Meu primeiro emprego na área de T.I já foi como DevOps, atuava como meio período por conta da minha faculdade.', 6, 2),

  (17, 'Cognito', '', 'Security Identity Compliance', 'purple', 1, '', '', 1, 3),
  (18, 'Secrets Manager', '', 'Security Identity Compliance', 'purple', 0, '', '', 2, 3),
  (19, 'KMS', '', 'Security Identity Compliance', 'purple', 0, '', '', 3, 3),
  (20, 'IAM', '', 'Security Identity Compliance', 'purple', 0, '', '', 4, 3),
  (21, 'S3', 'aws_s3_bucket.origem', 'Storage', 'orange', 0, 'Minha primeira linha de código', 'Minha primeira linha de código foi um console.log que coloquei em algum site, enquanto jogava ClickJogo', 5, 3),
  (22, 'Backup', '', 'Storage', 'orange', 1, '', '', 6, 3),
  (23, 'SageMaker', '', 'Machine Learning', 'purple', 1, '', '', 7, 3),

  (24, 'DynamoDB', 'aws_dynamodb_table.valores', 'Database', 'purple', 0, 'O que me move', 'Agora abrindo meu coração kkk, o que me move é ajudar pessoas, sabe aquela sensação de pertencimento quando você faz algo que gosta, um sentido de gratificante, é o que sinto quando vejo que consegui ajudar alguém, seja ouvindo, conversando e até mesmo aconselhando, me sinto bem. Talvez não seja uma motivação de trabalho, mas é o que me faz ser feliz.', 1, 4),
  (25, 'RDS', '', 'Database', 'purple', 1, '', '', 2, 4),
  (26, 'ElastiCache', '', 'Database', 'purple', 1, '', '', 3, 4),
  (27, 'Timestream', '', 'Database', 'purple', 1, '', '', 4, 4),
  (28, 'Athena', '', 'Analytics', 'purple', 1, '', '', 5, 4),
  (29, 'Kinesis', '', 'Analytics', 'purple', 0, '', '', 6, 4),
  (30, 'Kafka', '', 'Analytics', 'purple', 1, '', '', 7, 4),
  (31, 'Glue', '', 'Analytics', 'purple', 1, '', '', 8, 4),
  (32, 'Route 53', 'aws_route53_record.dns', 'Analytics', 'purple', 0, 'Onde estou agora', 'Onde estou agora: Rio Claro, SP, Brasil, trabalhando híbrido/remoto, disponível para oportunidades CLT/PJ. E tenho experiência fora do Brasil também.', 9, 4);
