import React, { useState, ReactNode } from 'react';

interface TabProps {
  value: string;
  label: string;
  children: ReactNode;
}

export function Tab({ children }: TabProps) {
  return <>{children}</>;
}

interface TabsProps {
  defaultValue: string;
  children: ReactNode[];
}

export function Tabs({ defaultValue, children }: TabsProps) {
  const tabList = React.Children.toArray(children) as React.ReactElement<TabProps>[];
  const [active, setActive] = useState(defaultValue);

  return (
    <div>
      <div className="flex gap-2 border-b mb-4">
        {tabList.map(tab => (
          <button
            key={tab.props.value}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
              active === tab.props.value
                ? 'border-blue-600 text-blue-700 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-blue-600'
            }`}
            onClick={() => setActive(tab.props.value)}
            type="button"
          >
            {tab.props.label}
          </button>
        ))}
      </div>
      <div>
        {tabList.map(tab =>
          tab.props.value === active ? (
            <div key={tab.props.value}>{tab.props.children}</div>
          ) : null
        )}
      </div>
    </div>
  );
} 