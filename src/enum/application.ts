export enum ApplicationExecutionStatus {
    DRAFT = 'draft',
    CLARITY = 'clarity',
    REJECT = 'reject',
    APPROVED = 'approved'
}

export enum ApplicationWorkflowType {
    APPROVAL = 'approval',
    INPUT = 'input'
}

export enum ApplicationWorkflowFieldPermission {
    VISIBLE = 'visible',
    EDITABLE = 'editable',
    READONLY = 'readonly',
    HIDDEN = 'hidden',
    CONDITIONAL = 'conditional'
}

export enum ApplicationWorkflowPermissionType {
    NEW = 'new',
    INITIATOR_SUMMARY = 'initiator_summary',
    ALL_TASK = 'all_task',
    WORKFLOW = 'workflow'
}
