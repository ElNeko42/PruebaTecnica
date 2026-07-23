CREATE TABLE IF NOT EXISTS opportunities (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  stage VARCHAR(50) NOT NULL DEFAULT 'prospecting',
  contact_id INT UNSIGNED NOT NULL,
  owner_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_opportunities_stage (stage),
  KEY idx_opportunities_contact (contact_id),
  KEY idx_opportunities_owner (owner_id),
  CONSTRAINT fk_opportunities_contact
    FOREIGN KEY (contact_id) REFERENCES contacts (id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_opportunities_owner
    FOREIGN KEY (owner_id) REFERENCES users (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
