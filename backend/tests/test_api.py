import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from main import app
from src.core.database import Base, get_db

@pytest.fixture
def client(monkeypatch):
    monkeypatch.setenv('REGISTRATION_CODE', 'test-registration-code-123456')
    engine = create_engine('sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    sessions = sessionmaker(bind=engine)
    def override():
        with sessions() as db:
            yield db
    app.dependency_overrides[get_db] = override
    with TestClient(app) as client:
        response = client.post('/v1/auth/register', json={
            'name': 'Manjil', 'email': 'manjil@example.com', 'password': 'strong-password-123',
            'registration_code': 'test-registration-code-123456'})
        assert response.status_code == 200, response.text
        client.headers['Authorization'] = f"Bearer {response.json()['token']}"
        yield client
    app.dependency_overrides.clear()
    engine.dispose()

def transaction(client, **overrides):
    categories = client.get('/v1/categories/').json()
    cat = categories[0] if categories else client.post('/v1/categories/', json={'name':'Food'}).json()
    return client.post('/v1/expenses/', json={'amount':12.5, 'category_id':cat['id'], 'date':'2026-09-10', **overrides})

def test_expense_crud_and_summary(client):
    expense = transaction(client).json()
    assert expense['created_by_name'] == 'Manjil'
    saving = transaction(client, type='saving', amount=50).json()
    assert client.get('/v1/expenses/summary').json()['total_expense'] == 12.5
    assert client.get('/v1/expenses/summary').json()['total_saving'] == 50
    assert client.put(f"/v1/expenses/{expense['id']}",json={'note':'Lunch','amount':20}).status_code == 200
    assert client.get('/v1/expenses/').json()['items'][0]['id'] == saving['id']
    assert client.delete(f"/v1/expenses/{expense['id']}").status_code == 200
    assert client.get(f"/v1/expenses/{expense['id']}").status_code == 404

def test_authentication_and_shared_attribution(client):
    first = transaction(client).json()
    assert client.post('/v1/auth/register', json={
        'name': 'Intruder', 'email': 'bad@example.com', 'password': 'strong-password-123',
        'registration_code': 'wrong-code'}).status_code == 403
    second_account = client.post('/v1/auth/register', json={
        'name': 'Second', 'email': 'second@example.com', 'password': 'another-password-123',
        'registration_code': 'test-registration-code-123456'})
    assert second_account.status_code == 200
    first_token = client.headers['Authorization']
    client.headers['Authorization'] = f"Bearer {second_account.json()['token']}"
    assert client.get('/v1/expenses/').json()['items'][0]['created_by_name'] == 'Manjil'
    second = transaction(client).json()
    assert second['created_by_name'] == 'Second'
    assert client.get('/v1/expenses/').json()['total'] == 2
    assert client.post('/v1/auth/logout').status_code == 204
    assert client.get('/v1/expenses/').status_code == 401
    client.headers.pop('Authorization')
    for path in ['/v1/expenses/', '/v1/finance/', '/v1/categories/', '/v1/import/', '/v1/export?type=csv']:
        assert client.get(path).status_code == 401
    client.headers['Authorization'] = first_token
    assert client.get('/v1/expenses/').status_code == 200

@pytest.mark.parametrize('changes', [{'amount':0},{'amount':-1},{'category_id':999},{'payment_method':'invalid'},{'date':'bad'}])
def test_invalid_expenses(client, changes):
    assert transaction(client, **changes).status_code == 422

def test_category_validation_and_protected_delete(client):
    assert client.post('/v1/categories/',json={'name':'   '}).status_code == 422
    e = transaction(client).json()
    assert client.delete(f"/v1/categories/{e['category_id']}").status_code == 409
    assert client.put(f"/v1/expenses/{e['id']}",json={'amount':None}).status_code == 422
    assert client.put(f"/v1/expenses/{e['id']}",json={'category_id':999}).status_code == 422

def test_filters_and_pagination(client):
    transaction(client, date='2026-01-01')
    transaction(client, date='2026-09-10')
    assert client.get('/v1/expenses/?start_date=2026-06-01').json()['total'] == 1
    assert client.get('/v1/expenses/?end_date=2026-06-01').json()['total'] == 1
    assert len(client.get('/v1/expenses/?limit=1&skip=1').json()['items']) == 1
    for query in ['limit=0','skip=-1','limit=1001','start_date=2026-09-10&end_date=2026-01-01']:
        assert client.get('/v1/expenses/?'+query).status_code == 422

def test_finance_persistence_and_conflict(client):
    state = client.get('/v1/finance/').json()
    assert state['data']['wishlistPots'] == []
    state['data']['monthlySalary'] = 80000
    state['data']['wishlistPots'] = [{'id':'pot','name':'Camera','targetAmount':1000,'currentSaved':100,'monthlyPledge':200}]
    state['data']['longTermGoals'] = [{'id':'goal','name':'Home','cost':1000000}]
    state['data']['rentConfig'] = {'baseRent':1000,'electricityRate':10,'waterWasteFee':50}
    state['data']['rentHistory'] = [{'id':'rent','month':'Bhadra 2083','baseRent':1000,'prevReading':10,'currReading':20,'units':10,'electricityBill':100,'waterWasteFee':50,'totalAmount':1150,'paidDate':'2026-09-10'}]
    saved = client.put('/v1/finance/',json=state)
    assert saved.status_code == 200
    assert client.get('/v1/finance/').json() == saved.json()
    assert client.put('/v1/finance/',json=state).status_code == 409
    current = saved.json()
    current['data']['wishlistPots'][0]['currentSaved'] = 1200
    assert client.put('/v1/finance/',json=current).status_code == 422
    assert client.get('/v1/finance/').json()['data']['wishlistPots'][0]['currentSaved'] == 100

def test_rent_validation(client):
    state = client.get('/v1/finance/').json()
    record = {'id':'rent','month':'Bhadra 2083','baseRent':1000,'prevReading':10,'currReading':20,'units':10,'electricityBill':100,'waterWasteFee':50,'totalAmount':1150,'paidDate':'2026-09-10'}
    state['data']['rentHistory'] = [record, {**record,'id':'other'}]
    assert client.put('/v1/finance/',json=state).status_code == 422
    state['data']['rentHistory'] = [{**record,'totalAmount':1}]
    assert client.put('/v1/finance/',json=state).status_code == 422
