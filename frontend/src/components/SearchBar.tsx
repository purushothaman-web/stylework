import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <input
      type="text"
      placeholder="Search by name, email, phone..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};
