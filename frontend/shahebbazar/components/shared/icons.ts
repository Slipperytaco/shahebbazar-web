/**
 * Runtime icon resolution.
 *
 * Components import icons directly from `lucide-react`. This module covers
 * the case where the icon is not known at compile time, because
 * `categories.category_icon` is stored as a string.
 *
 * Brand marks are provided by `@icons-pack/react-simple-icons`, as
 * `lucide-react` does not include trademarked logos.
 */

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

export function categoryIcon(stored: string | null): LucideIcon {
    return (stored && CATEGORY_ICONS[stored]) || LayoutGrid;
}
