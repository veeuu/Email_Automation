from jinja2 import Environment, BaseLoader, select_autoescape
from db.models import Subscriber


def render_template(template_str: str, subscriber: Subscriber = None) -> str:
    """Render Jinja template with subscriber context"""
    env = Environment(
        loader=BaseLoader(),
        autoescape=select_autoescape(['html', 'xml']),
        trim_blocks=True,
        lstrip_blocks=True
    )
    
    context = {}
    if subscriber:
        context = {
            "email": subscriber.email,
            "name": subscriber.name or subscriber.email.split("@")[0],
            "custom_fields": subscriber.custom_fields or {}
        }
    
    try:
        template = env.from_string(template_str)
        return template.render(**context)
    except Exception as e:
        return template_str
