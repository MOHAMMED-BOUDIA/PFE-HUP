const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <nav className="-mb-px flex gap-1" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              type="button"
              className={`group relative flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-semibold transition-all duration-200 outline-none ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab.icon && <tab.icon className="h-4 w-4" />}
              <span>{tab.label}</span>
              {/* Active indicator */}
              <span
                className={`absolute inset-x-0 -bottom-px h-0.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-indigo-600 dark:bg-indigo-400'
                    : 'bg-transparent group-hover:bg-gray-300 dark:group-hover:bg-gray-700'
                }`}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Tabs;
