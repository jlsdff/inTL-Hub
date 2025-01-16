"""Peewee migrations -- 029_add_audit_table.py."""

from contextlib import suppress

import peewee as pw
from peewee_migrate import Migrator

with suppress(ImportError):
    pass


def migrate(migrator: Migrator, database: pw.Database, *, fake=False):
    """Write your migrations here."""
    # Define the User model to use as a foreign key reference
    migrator.sql(
        """
        CREATE TABLE audits (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    timestamp TIMESTAMP NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES user(username)
);
        """
    )


def rollback(migrator: Migrator, database: pw.Database, *, fake=False):
    """Write your rollback migrations here."""
    migrator.remove_model("audits")
