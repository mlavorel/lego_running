import type { ReactNode } from 'react';

export type TabKey = 'sources' | 'segments' | 'builder';

type Props = {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  children: ReactNode;
};

const TABS: { key: TabKey; label: string }[] = [
  { key: 'sources', label: 'Sources' },
  { key: 'segments', label: 'Segments' },
  { key: 'builder', label: 'Builder' },
];

export function Sidebar({ activeTab, onTabChange, children }: Props) {
  return (
    <aside className="sidebar">
      <h1>Lego Running</h1>
      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? 'active' : ''}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="panel">{children}</div>
    </aside>
  );
}
