import sqlite3
import pytest
from server import storage


def test_database_context_commits_rolls_back_and_releases_handle(tmp_path,monkeypatch):
    monkeypatch.setattr(storage,'DB',tmp_path/'context.sqlite3')
    with storage.connect() as connection:
        connection.execute('CREATE TABLE context_test(value INTEGER)')
        connection.execute('INSERT INTO context_test VALUES (1)')
    with pytest.raises(sqlite3.ProgrammingError):
        connection.execute('SELECT 1')
    with pytest.raises(ValueError):
        with storage.connect() as connection:
            connection.execute('INSERT INTO context_test VALUES (2)')
            raise ValueError('transaction rollback fixture')
    with storage.connect() as connection:
        assert connection.execute('SELECT value FROM context_test').fetchall()==[(1,)]
    storage.DB.unlink()
    assert not storage.DB.exists()
