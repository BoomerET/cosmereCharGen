import React from 'react';

export default function ListSection({ title, items, onAdd, onChangeItem, onRemove }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center mb-2">
          <input
            className="flex-1 border rounded p-1"
            value={item}
            onChange={e => onChangeItem(idx, e.target.value)}
            placeholder={title.slice(0, -1)}
          />
          <button onClick={() => onRemove(idx)} className="ml-2 text-red-500">×</button>
        </div>
      ))}
      <button onClick={onAdd} className="px-3 py-1 bg-blue-500 text-white rounded">Add {title.slice(0, -1)}</button>
    </div>
  );
}

