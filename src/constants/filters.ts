
export const DEFAULT_CATEGORY = 'all';
export const DEFAULT_SORT_ORDER = 'relevance'; 
export const DEFAULT_LAYOUT_STYLE = 'grid';

export const FILTER_TYPE_CATEGORY = 'category';
export const FILTER_TYPE_SORT = 'sortOrder'; 
export const FILTER_TYPE_LAYOUT = 'layoutStyle';

export const SECTION_TITLE_CATEGORIES = 'Categorías';
export const SECTION_TITLE_SORT = 'Ordenar por';
export const SECTION_TITLE_LAYOUT = 'Visualización';

export const ICON_SQUARES = 'Squares2X2Icon';
export const ICON_LIST_BULLET = 'ListBulletIcon';

export const SORT_ORDER_ITEMS = [
    { label: 'Precio más bajo', value: 'lowest-price' },
    { label: 'Precio más alto', value: 'highest-price' },
    { label: 'A - Z', value: 'a-z' },
    { label: 'Z - A', value: 'z-a' },
];

export const LAYOUT_STYLE_ITEM_GRID = "grid"
export const LAYOUT_STYLE_ITEM_LIST = "list"

export const LAYOUT_STYLE_ITEMS = [
    { label: 'Grilla', value: LAYOUT_STYLE_ITEM_GRID, iconName: ICON_SQUARES },
    { label: 'Lista', value: LAYOUT_STYLE_ITEM_LIST, iconName: ICON_LIST_BULLET },
];