// Runtime icon resolution.

import {
    BriefcaseMedical,
    Factory,
    GraduationCap,
    LayoutGrid,
    MapPin,
    Palette,
    ShoppingBag,
    Shirt,
    Sprout,
    TreePalm,
    UtensilsCrossed,
    Wrench,
    type LucideIcon,
} from "lucide-react";

/** Icon components keyed by the value stored in `categories.category_icon`. */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
    medical: BriefcaseMedical,
    heart: BriefcaseMedical,
    palm: TreePalm,
    "map-pin": MapPin,
    utensils: UtensilsCrossed,
    bag: ShoppingBag,
    cap: GraduationCap,
    wrench: Wrench,
    shirt: Shirt,
    palette: Palette,
    sprout: Sprout,
    factory: Factory,
};

export const CATEGORY_ICON_NAMES = Object.keys(CATEGORY_ICONS);

export function categoryIcon(stored: string | null): LucideIcon {
    return (stored && CATEGORY_ICONS[stored]) || LayoutGrid;
}
