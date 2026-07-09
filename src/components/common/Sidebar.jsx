import { STORE_INFO, STORE_KEYS } from '../../constants';

function RoleBadge({ staffMember, roles }) {
  const role = roles.find((r) => r.key === staffMember.role);
  if (!role || role.key === 'staff') return null;
  if (role.key === 'GM' || role.is_owner) {
    return <span className="text-[10px] px-[5px] py-[1px] rounded font-semibold bg-[#E1F5EE] text-[#085041]">{role.label}</span>;
  }
  if (role.can_login) {
    return <span className="text-[10px] px-[5px] py-[1px] rounded font-semibold bg-[#EEEDFE] text-[#3C3489]">{role.label}</span>;
  }
  return null;
}

export default function Sidebar({ collapsed, staff, roles, view, si, onGoView, onGoPersonal, onTrySettings, onClose }) {
  const groups = { fushimi: [], nijo: [], gm: [] };
  staff.forEach((s) => {
    const role = roles.find((r) => r.key === s.role);
    if (role?.key === 'GM' || role?.is_owner) {
      groups.gm.push(s);
      return;
    }
    STORE_KEYS.forEach((sk) => {
      if (s.stores.includes(sk) && !groups[sk].find((x) => x.key === s.key)) groups[sk].push(s);
    });
  });

  const item = (s) => {
    const isOwner = roles.find((r) => r.key === s.role)?.is_owner;
    const active = isOwner ? view === 'owner' : view === 'personal' && si === s.key;
    return (
      <div
        key={s.key}
        className={`flex items-center justify-between px-[14px] py-[6px] cursor-pointer text-[13px] ${
          active ? 'bg-white text-stone-900 font-medium' : 'text-stone-500 hover:bg-white hover:text-stone-900'
        }`}
        onClick={() => (isOwner ? onGoView('owner') : onGoPersonal(s.key))}
      >
        <span>{s.name}</span>
        <RoleBadge staffMember={s} roles={roles} />
      </div>
    );
  };

  return (
    <>
      {!collapsed && (
        <div className="fixed inset-0 bg-black/35 z-30 md:hidden" onClick={onClose} />
      )}
      <div
        className={`bg-[#F5F3EE] flex flex-col z-40 ${
          collapsed ? 'hidden' : 'fixed inset-y-0 left-0 w-[230px] shadow-2xl'
        } md:static md:flex md:z-auto md:w-[190px] md:min-w-[190px] md:shadow-none md:border-r md:border-stone-200`}
      >
        <div className="px-[14px] py-[10px] border-b border-stone-100 flex-shrink-0">
          <span className="text-[13px] font-semibold whitespace-nowrap">About Us ☕</span>
        </div>
        <div className="overflow-y-auto flex-1 py-2">
          <div className="text-[11px] font-semibold text-stone-500 tracking-wide px-[14px] pt-[10px] pb-1">全体</div>
          <div
            className={`px-[14px] py-[6px] cursor-pointer text-[13px] ${view === 'overview' ? 'bg-white text-stone-900 font-medium' : 'text-stone-500 hover:bg-white hover:text-stone-900'}`}
            onClick={() => onGoView('overview')}
          >📋 全員一覧</div>
          <div
            className={`px-[14px] py-[6px] cursor-pointer text-[13px] ${view === 'storetodos' ? 'bg-white text-stone-900 font-medium' : 'text-stone-500 hover:bg-white hover:text-stone-900'}`}
            onClick={() => onGoView('storetodos')}
          >🏪 店舗月次目標</div>
          <div
            className={`px-[14px] py-[6px] cursor-pointer text-[13px] ${view === 'settings' ? 'bg-white text-stone-900 font-medium' : 'text-stone-500 hover:bg-white hover:text-stone-900'}`}
            onClick={onTrySettings}
          >⚙️ 設定</div>
          <div className="h-px bg-stone-100 mx-[14px] my-[5px]" />
          <div className="text-[11px] font-semibold text-stone-500 tracking-wide px-[14px] pt-[10px] pb-1">{STORE_INFO.fushimi.label}</div>
          {groups.fushimi.map(item)}
          <div className="h-px bg-stone-100 mx-[14px] my-[5px]" />
          <div className="text-[11px] font-semibold text-stone-500 tracking-wide px-[14px] pt-[10px] pb-1">{STORE_INFO.nijo.label}</div>
          {groups.nijo.map(item)}
          <div className="h-px bg-stone-100 mx-[14px] my-[5px]" />
          <div className="text-[11px] font-semibold text-stone-500 tracking-wide px-[14px] pt-[10px] pb-1">GM・オーナー</div>
          {groups.gm.map(item)}
        </div>
      </div>
    </>
  );
}
