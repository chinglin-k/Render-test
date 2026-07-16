"""
餐廳、菜單瀏覽與搜尋篩選單元測試
"""


def test_list_restaurants_empty(client):
    """空資料庫回傳空列表"""
    res = client.get("/restaurants")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_cart_unauthenticated(client):
    """未登入存取購物車應回傳 401"""
    res = client.get("/cart")
    assert res.status_code == 401


def test_orders_unauthenticated(client):
    """未登入存取訂單應回傳 401"""
    res = client.get("/orders")
    assert res.status_code == 401


def test_coupon_validate_not_found(client):
    """驗證不存在的優惠券"""
    res = client.get("/coupons/validate/NOTEXIST")
    assert res.status_code == 200
    data = res.json()
    assert data["valid"] is False
    assert "not found" in data["message"].lower()


def test_restaurant_not_found(client):
    """查詢不存在的餐廳應回傳 404"""
    res = client.get("/restaurants/99999")
    assert res.status_code == 404


def test_restaurant_search_param(client):
    """搜尋端點應可接受 search 查詢參數"""
    res = client.get("/restaurants?search=pizza")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_menu_filter_param(client):
    """菜單端點應可接受 search 和 category_id 參數"""
    res = client.get("/restaurants/1/menu?search=雞&category_id=1")
    assert res.status_code == 200


def test_admin_requires_auth(client):
    """未登入存取 admin 端點應回傳 401"""
    res = client.get("/admin/restaurants")
    assert res.status_code == 401


def test_reviews_requires_auth(client):
    """未登入建立評價應回傳 401"""
    res = client.post("/reviews", json={"order_id": 1, "rating": 5})
    assert res.status_code == 401
