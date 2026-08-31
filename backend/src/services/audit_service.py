from src.models.model import AuditLogModel

def log_action(db, action: str, entity_type: str, entity_id: int, summary: str, user_id: int):
    log = AuditLogModel(
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        entity_summary=summary,
        performed_by=user_id,
    )
    db.add(log)
    db.commit()