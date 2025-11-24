import pytest
from db.models import Subscriber
from templates.render import render_template


def test_render_template_with_subscriber():
    subscriber = Subscriber(
        email="test@example.com",
        name="John Doe",
        custom_fields={"company": "Acme"}
    )
    
    template = "Hello {{ name }}, welcome to {{ custom_fields.company }}!"
    result = render_template(template, subscriber)
    
    assert "John Doe" in result
    assert "Acme" in result


def test_render_template_without_subscriber():
    template = "Hello {{ name }}!"
    result = render_template(template, None)
    
    assert result == template


def test_render_template_with_conditionals():
    subscriber = Subscriber(
        email="test@example.com",
        name="Jane",
        custom_fields={"vip": True}
    )
    
    template = "{% if custom_fields.vip %}VIP Member{% else %}Regular{% endif %}"
    result = render_template(template, subscriber)
    
    assert "VIP Member" in result
