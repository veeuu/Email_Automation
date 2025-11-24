import logging
import json
from datetime import datetime

logger = logging.getLogger(__name__)


class MetricsCollector:
    def __init__(self):
        self.metrics = {}
    
    def record_send(self, status: str, duration_ms: float):
        """Record email send metric"""
        key = f"send_{status}"
        if key not in self.metrics:
            self.metrics[key] = {"count": 0, "total_duration": 0}
        
        self.metrics[key]["count"] += 1
        self.metrics[key]["total_duration"] += duration_ms
    
    def record_bounce(self, bounce_type: str):
        """Record bounce metric"""
        key = f"bounce_{bounce_type}"
        if key not in self.metrics:
            self.metrics[key] = 0
        self.metrics[key] += 1
    
    def get_metrics(self):
        """Get current metrics"""
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "metrics": self.metrics
        }
    
    def log_metrics(self):
        """Log metrics as JSON"""
        logger.info(json.dumps(self.get_metrics()))


metrics_collector = MetricsCollector()
