export interface SubNavItem {
  id: string;
  label: string;
}

interface SubNavProps {
  items: SubNavItem[];
  active: string;
  onSelect: (id: string) => void;
  title?: string;
}

/**
 * Secondary vertical navigation rendered as a small sidebar inside a section
 * page (e.g. Search Console / Analytics sub-views). Collapses to a horizontal
 * scroller on narrow screens.
 */
const SubNav = ({ items, active, onSelect, title }: SubNavProps) => (
  <nav className="lg:w-52 lg:shrink-0">
    {title && (
      <div className="mb-2 px-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
        {title}
      </div>
    )}
    <div className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`group relative flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-left text-[0.82rem] transition-colors ${
              isActive ? "bg-signal-soft text-signal" : "text-ink-dim hover:bg-panel-2 hover:text-ink"
            }`}
          >
            <span
              className={`hidden h-4 w-[3px] rounded-r-full bg-signal-bright transition-opacity lg:block ${
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
              }`}
              aria-hidden="true"
            />
            <span className={isActive ? "font-semibold" : "font-medium"}>{item.label}</span>
          </button>
        );
      })}
    </div>
  </nav>
);

export default SubNav;
