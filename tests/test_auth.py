"""
Auth 端點單元測試：register / login / 重複 email / 錯誤密碼
"""


def test_register_success(client):
    res = client.post("/auth/register", json={
        "name": "測試用戶",
        "email": "test_user@example.com",
        "password": "password123",
        "phone": "0912345678"
    })
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "test_user@example.com"
    assert data["role"] == "consumer"
    assert data["is_active"] is True
    assert "password_hash" not in data


def test_register_duplicate_email(client):
    client.post("/auth/register", json={
        "name": "重複",
        "email": "dup@example.com",
        "password": "pass"
    })
    res = client.post("/auth/register", json={
        "name": "重複2",
        "email": "dup@example.com",
        "password": "pass"
    })
    assert res.status_code == 400
    assert "already registered" in res.json()["detail"]


def test_login_success(client):
    client.post("/auth/register", json={
        "name": "登入測試",
        "email": "login@example.com",
        "password": "mypassword"
    })
    res = client.post("/auth/login", data={
        "username": "login@example.com",
        "password": "mypassword"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client):
    client.post("/auth/register", json={
        "name": "錯誤密碼測試",
        "email": "wrong@example.com",
        "password": "correctpass"
    })
    res = client.post("/auth/login", data={
        "username": "wrong@example.com",
        "password": "wrongpass"
    })
    assert res.status_code == 401


def test_login_nonexistent_user(client):
    res = client.post("/auth/login", data={
        "username": "nobody@example.com",
        "password": "pass"
    })
    assert res.status_code == 401


def test_response_no_password_hash(client):
    res = client.post("/auth/register", json={
        "name": "安全測試",
        "email": "security@example.com",
        "password": "securepass"
    })
    assert "password_hash" not in res.json()
