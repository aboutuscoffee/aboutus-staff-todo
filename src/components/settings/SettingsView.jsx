import StaffTable from './StaffTable';
import RoleTable from './RoleTable';
import PasswordTable from './PasswordTable';
import SelfPasswordForm from './SelfPasswordForm';
import { loginableStaff } from '../../lib/permissions';

export default function SettingsView({
  staff, roles, isAdmin, canAssignOwner,
  onReorderStaff, onUpdateStaffField, onDeleteStaff, onAddStaff,
  onTogglePerm, onToggleViewScope, onAddRole, onDeleteRole,
  onResetPassword, onChangeOwnPassword,
}) {
  if (!isAdmin) {
    return (
      <div>
        <div className="text-[15px] font-semibold mb-3.5">⚙️ 設定</div>
        <div className="mb-7">
          <div className="text-xs font-semibold mb-2.5 pb-1.5 border-b border-stone-100">パスワード変更</div>
          <SelfPasswordForm onChangePassword={onChangeOwnPassword} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-[15px] font-semibold mb-3.5">⚙️ 設定</div>

      <div className="mb-7">
        <div className="text-xs font-semibold mb-2.5 pb-1.5 border-b border-stone-100">スタッフ管理</div>
        <StaffTable staff={staff} roles={roles} canAssignOwner={canAssignOwner} onReorder={onReorderStaff} onUpdateField={onUpdateStaffField} onDelete={onDeleteStaff} onAdd={onAddStaff} />
      </div>

      <div className="mb-7">
        <div className="text-xs font-semibold mb-2.5 pb-1.5 border-b border-stone-100">役職・権限管理</div>
        <RoleTable roles={roles} staff={staff} onTogglePerm={onTogglePerm} onToggleViewScope={onToggleViewScope} onAddRole={onAddRole} onDeleteRole={onDeleteRole} />
      </div>

      <div className="mb-7">
        <div className="text-xs font-semibold mb-2.5 pb-1.5 border-b border-stone-100">パスワード管理</div>
        <PasswordTable staff={loginableStaff(staff, roles)} roles={roles} onReset={onResetPassword} />
      </div>
    </div>
  );
}
