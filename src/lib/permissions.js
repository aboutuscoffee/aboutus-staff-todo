export function findRole(roles, key) {
  return roles.find((r) => r.key === key);
}

export function canAccessEval(staff, roles, viewerKey, targetKey) {
  const viewer = staff.find((s) => s.key === viewerKey);
  const target = staff.find((s) => s.key === targetKey);
  if (!viewer || !target) return false;
  const viewerRole = findRole(roles, viewer.role);
  if (viewerRole?.is_owner) return true;
  return viewerRole?.view_scope?.includes(target.role) ?? false;
}

export function canEditEval(staff, roles, viewerKey, targetKey) {
  const viewer = staff.find((s) => s.key === viewerKey);
  const viewerRole = viewer && findRole(roles, viewer.role);
  return (viewerRole?.can_edit ?? false) && canAccessEval(staff, roles, viewerKey, targetKey);
}

export function isAdminRole(staff, roles, key) {
  const staffMember = staff.find((s) => s.key === key);
  const role = staffMember && findRole(roles, staffMember.role);
  return role?.key === 'GM' || !!role?.is_owner;
}

export function isOwnerRole(staff, roles, key) {
  const staffMember = staff.find((s) => s.key === key);
  const role = staffMember && findRole(roles, staffMember.role);
  return !!role?.is_owner;
}

export function canOfferOwnTask(staff, roles, key) {
  const staffMember = staff.find((s) => s.key === key);
  const role = staffMember && findRole(roles, staffMember.role);
  return !!role?.can_edit;
}

export function canConfirmTraining(staff, roles, key) {
  const staffMember = staff.find((s) => s.key === key);
  const role = staffMember && findRole(roles, staffMember.role);
  return !!role?.can_edit;
}

export function canRestrictTask(staff, roles, key) {
  const staffMember = staff.find((s) => s.key === key);
  const role = staffMember && findRole(roles, staffMember.role);
  return role?.key === 'SM' || role?.key === 'GM';
}

export function canViewTask(staff, roles, viewerKey, task) {
  if (!task.restricted || viewerKey === task.staff_key) return true;
  const ownerRoleKey = staff.find((s) => s.key === task.staff_key)?.role;
  const viewerRoleKey = staff.find((s) => s.key === viewerKey)?.role;
  if (ownerRoleKey === 'SM') return viewerRoleKey === 'SM' || isAdminRole(staff, roles, viewerKey);
  if (ownerRoleKey === 'GM') return viewerRoleKey === 'GM' || isOwnerRole(staff, roles, viewerKey);
  return true;
}

export function loginableStaff(staff, roles) {
  return staff.filter((s) => findRole(roles, s.role)?.can_login);
}

export function currentOwnerKey(staff, roles) {
  const ownerRole = roles.find((r) => r.is_owner);
  if (!ownerRole) return null;
  const owner = staff.find((s) => s.role === ownerRole.key);
  return owner ? owner.key : null;
}

export function canAssignOwner(staff, roles, viewerKey) {
  const ownerKey = currentOwnerKey(staff, roles);
  if (!ownerKey) return true;
  return viewerKey === ownerKey;
}
