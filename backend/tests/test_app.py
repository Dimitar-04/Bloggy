import importlib


def test_app_imports_with_expected_title(monkeypatch):
    monkeypatch.setenv("MONGO_URL", "mongodb://localhost:27017")
    monkeypatch.setenv("DATABASE_NAME", "blogapp_test")

    main = importlib.import_module("main")

    assert main.app.title == "Blog API"
