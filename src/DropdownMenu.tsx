import { useState, useRef, useEffect } from 'preact/hooks';
import { ChevronDown } from './ChevronIcons';

export interface MenuItem {
  id: string;
  type: 'checkbox' | 'label';
  label: string;
  checked?: boolean;
  children?: MenuItem[];
}

interface DropdownMenuProps {
  items: MenuItem[];
  onChange: (itemId: string, checked: boolean) => void;
  title?: string;
  tooltip?: string;
  className?: string;
}

export const DropdownMenu = ({ 
  items, 
  onChange, 
  title,
  tooltip,
  className = "" 
}: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const MenuItem = ({ item, depth = 0 }: { item: MenuItem; depth?: number }) => {
    const paddingLeft = `${depth * 1}rem`;

    if (item.type === 'checkbox') {
      return (
        <label 
          class="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
          style={{ paddingLeft }}
        >
          <input
            type="checkbox"
            checked={item.checked}
            onChange={(e) => onChange(item.id, (e.target as HTMLInputElement).checked)}
            class="mr-2"
          />
          <span class="text-sm">{item.label}</span>
        </label>
      );
    }

    return (
      <div>
        <div 
          class="px-4 py-2 font-semibold text-sm text-gray-700"
          style={{ paddingLeft }}
        >
          {item.label}
        </div>
        {item.children?.map((child) => (
          <MenuItem key={child.id} item={child} depth={depth + 1} />
        ))}
      </div>
    );
  };

  return (
    <div 
      class={`relative inline-block text-left ${className}`} 
      ref={menuRef}
      title={tooltip}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        class="inline-flex items-center justify-center p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
      >
        {title && <span class="mr-2 text-sm">{title}</span>}
        <ChevronDown />
      </div>

      {isOpen && (
        <div class="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div class="py-1">
            {items.map((item) => (
              <MenuItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};