from sqlalchemy.orm import Session
from db.models import WorkflowInstance, Event, Subscriber
from uuid import UUID, uuid4
from datetime import datetime, timedelta
import json


class WorkflowEngine:
    def __init__(self, db: Session):
        self.db = db
    
    def start_flow(self, flow_id: UUID, subscriber_id: UUID, flow_definition: dict):
        """Start a new workflow instance"""
        instance = WorkflowInstance(
            flow_id=flow_id,
            subscriber_id=subscriber_id,
            current_node=flow_definition.get("start_node"),
            state={"visited_nodes": []}
        )
        self.db.add(instance)
        self.db.commit()
        self.db.refresh(instance)
        return instance
    
    def execute_node(self, instance_id: UUID, node_definition: dict):
        """Execute a workflow node"""
        instance = self.db.query(WorkflowInstance).filter(
            WorkflowInstance.id == instance_id
        ).first()
        
        if not instance:
            return None
        
        node_type = node_definition.get("type")
        
        if node_type == "send":
            self._execute_send_node(instance, node_definition)
        elif node_type == "wait":
            self._execute_wait_node(instance, node_definition)
        elif node_type == "condition":
            self._execute_condition_node(instance, node_definition)
        
        instance.updated_at = datetime.utcnow()
        self.db.commit()
        return instance
    
    def _execute_send_node(self, instance: WorkflowInstance, node_def: dict):
        """Send email in workflow"""
        template_id = node_def.get("template_id")
        instance.state["last_send"] = {
            "template_id": str(template_id),
            "sent_at": datetime.utcnow().isoformat()
        }
    
    def _execute_wait_node(self, instance: WorkflowInstance, node_def: dict):
        """Wait for duration or event"""
        wait_type = node_def.get("wait_type")  # duration or event
        if wait_type == "duration":
            duration_hours = node_def.get("duration_hours", 24)
            instance.state["wait_until"] = (
                datetime.utcnow() + timedelta(hours=duration_hours)
            ).isoformat()
    
    def _execute_condition_node(self, instance: WorkflowInstance, node_def: dict):
        """Evaluate condition and route"""
        condition = node_def.get("condition")
        subscriber = self.db.query(Subscriber).filter(
            Subscriber.id == instance.subscriber_id
        ).first()
        
        if self._evaluate_condition(condition, subscriber, instance):
            instance.state["condition_result"] = "true"
            instance.current_node = node_def.get("true_node")
        else:
            instance.state["condition_result"] = "false"
            instance.current_node = node_def.get("false_node")
    
    def _evaluate_condition(self, condition: dict, subscriber: Subscriber, instance: WorkflowInstance) -> bool:
        """Evaluate a condition"""
        condition_type = condition.get("type")
        
        if condition_type == "opened":
            campaign_id = condition.get("campaign_id")
            opened = self.db.query(Event).filter(
                Event.subscriber_id == subscriber.id,
                Event.campaign_id == campaign_id,
                Event.event_type == "open"
            ).first()
            return opened is not None
        
        elif condition_type == "clicked":
            campaign_id = condition.get("campaign_id")
            clicked = self.db.query(Event).filter(
                Event.subscriber_id == subscriber.id,
                Event.campaign_id == campaign_id,
                Event.event_type == "click"
            ).first()
            return clicked is not None
        
        return False
