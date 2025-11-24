from sqlalchemy.orm import Session
from db.models import Template
from uuid import UUID
from datetime import datetime


class TemplateService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_template(self, name: str, subject: str, html: str, text_content: str = None, created_by: UUID = None):
        template = Template(
            name=name,
            subject=subject,
            html=html,
            text_content=text_content,
            version=1,
            created_by=created_by
        )
        self.db.add(template)
        self.db.commit()
        self.db.refresh(template)
        return template
    
    def update_template(self, template_id: UUID, name: str, subject: str, html: str, text_content: str = None):
        template = self.db.query(Template).filter(Template.id == template_id).first()
        if not template:
            return None
        
        template.name = name
        template.subject = subject
        template.html = html
        template.text_content = text_content
        template.version += 1
        template.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(template)
        return template
    
    def get_template(self, template_id: UUID):
        return self.db.query(Template).filter(Template.id == template_id).first()
