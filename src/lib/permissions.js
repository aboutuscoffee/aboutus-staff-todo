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

export function loginableStaff(staff, roles) {
  return staff.filter((s) => findRole(roles, s.role)?.can_login);
}
