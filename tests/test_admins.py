import importlib
import sys
import types
from fastapi.testclient import TestClient
import pytest

class DummyDocument:
    def __init__(self, id, data=None):
        self.id = id
        self._data = data

    @property
    def exists(self):
        return self._data is not None

    def to_dict(self):
        return self._data

    def get(self):
        return self

class DummyDocumentRef:

    def __init__(self, collection, id):
        self.collection = collection
        self.id = id

    def get(self):
        data = self.collection.docs.get(self.id)
        return DummyDocument(self.id, data)

    def set(self, data):
        self.collection.docs[self.id] = data

    def update(self, data):
        if self.id not in self.collection.docs:
            raise KeyError
        self.collection.docs[self.id].update(data)

    def delete(self):
        self.collection.docs.pop(self.id, None)


class DummyCollection:
    def __init__(self):
        self.docs = {}

    def stream(self):
        for id, data in self.docs.items():
            yield DummyDocument(id, data)

    def document(self, id=None):
        if id is None:
            id = f"id{len(self.docs)+1}"
        return DummyDocumentRef(self, id)


class DummyFirestore:
    def __init__(self):
        self.collections = {}

    def client(self):
        return self

    def collection(self, name):
        if name not in self.collections:
            self.collections[name] = DummyCollection()
        return self.collections[name]

def get_test_client(monkeypatch):
    fs = DummyFirestore()
    dummy_firebase = types.SimpleNamespace(
        initialize_app=lambda cred: None,
        credentials=types.SimpleNamespace(Certificate=lambda p: None),
        firestore=fs,
    )
    monkeypatch.setitem(sys.modules, 'firebase_admin', dummy_firebase)
    monkeypatch.setitem(sys.modules, 'firebase_admin.credentials', dummy_firebase.credentials)
    monkeypatch.setitem(sys.modules, 'firebase_admin.firestore', fs)
    monkeypatch.setenv('FIREBASE_CREDENTIALS', 'dummy')
    module = importlib.import_module('backend.main_firestore', package='Admin')
    client = TestClient(module.app)
    return client, module

@pytest.fixture
def client(monkeypatch):
    client, _ = get_test_client(monkeypatch)
    return client

def test_list_users_empty(client):
    response = client.get('/users')
    assert response.status_code == 200
    assert response.json() == []

def test_create_and_get_user(monkeypatch):
    client, module = get_test_client(monkeypatch)
    user_data = {'name': 'Alice', 'telegram': '@alice', 'excursionsDone': 0}
    resp = client.post('/users', json=user_data)
    assert resp.status_code == 200
    created = resp.json()
    assert created['name'] == 'Alice'
    user_id = created['id']
    resp = client.get(f'/users/{user_id}')
    assert resp.status_code == 200
    assert resp.json()['telegram'] == '@alice'
    # delete user and verify 404
    client.delete(f'/users/{user_id}')
    resp = client.get(f'/users/{user_id}')
    assert resp.status_code == 404
